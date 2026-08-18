import "server-only";
import type { Prisma, PrismaClient, TaskStatus } from "@prisma/client";
import { prisma } from "@/server/db";
import { ForbiddenError } from "@/server/auth";
import { logActivity } from "@/server/services/activity.service";
import { notify } from "@/server/services/notification.service";

type Tx = PrismaClient | Prisma.TransactionClient;

/** The exact state machine from the spec. CANCELLED is reachable from any non-terminal status. */
export const TASK_TRANSITIONS: Record<TaskStatus, TaskStatus[]> = {
  PLANNED: ["READY", "BLOCKED", "CANCELLED"],
  BLOCKED: ["READY", "CANCELLED"],
  READY: ["IN_PROGRESS", "CANCELLED"],
  IN_PROGRESS: ["REVIEW", "COMPLETED", "CANCELLED"],
  REVIEW: ["COMPLETED", "REVISION", "CANCELLED"],
  REVISION: ["IN_PROGRESS", "REVIEW", "CANCELLED"],
  COMPLETED: [],
  CANCELLED: [],
};

export class InvalidTransitionError extends Error {
  constructor(from: TaskStatus, to: TaskStatus) {
    super(`ไม่สามารถเปลี่ยนสถานะงานจาก ${from} เป็น ${to} ได้`);
    this.name = "InvalidTransitionError";
  }
}

export function assertTransition(from: TaskStatus, to: TaskStatus) {
  if (!TASK_TRANSITIONS[from]?.includes(to)) {
    throw new InvalidTransitionError(from, to);
  }
}

export async function createTask(params: {
  campaignId: string;
  name: string;
  description?: string;
  teamId?: string | null;
  ownerId?: string | null;
  approverId?: string | null;
  dueDate?: Date | null;
  priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT" | null;
  createdBy: string;
}) {
  const task = await prisma.task.create({
    data: {
      campaignId: params.campaignId,
      name: params.name,
      description: params.description,
      teamId: params.teamId ?? null,
      ownerId: params.ownerId ?? null,
      approverId: params.approverId ?? null,
      dueDate: params.dueDate ?? null,
      priority: params.priority ?? null,
      status: "PLANNED",
      createdBy: params.createdBy,
    },
  });

  await logActivity(prisma, {
    campaignId: params.campaignId,
    taskId: task.id,
    actorId: params.createdBy,
    eventType: "TASK_CREATED",
    metadata: { name: task.name },
  });

  return task;
}

export async function updateTask(
  taskId: string,
  actorId: string,
  data: Partial<{
    name: string;
    description: string | null;
    teamId: string | null;
    ownerId: string | null;
    approverId: string | null;
    dueDate: Date | null;
    priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT" | null;
  }>
) {
  const task = await prisma.task.update({ where: { id: taskId }, data });

  await logActivity(prisma, {
    campaignId: task.campaignId,
    taskId: task.id,
    actorId,
    eventType: "TASK_UPDATED",
    metadata: data as Record<string, unknown>,
  });

  return task;
}

export async function deleteTask(taskId: string) {
  const task = await prisma.task.findUniqueOrThrow({ where: { id: taskId } });
  if (task.status !== "PLANNED") {
    throw new Error("ลบได้เฉพาะงานที่ยังอยู่ในสถานะวางแผนแล้วเท่านั้น");
  }
  return prisma.task.delete({ where: { id: taskId } });
}

export async function startTask(taskId: string, actorId: string) {
  const task = await prisma.task.findUniqueOrThrow({ where: { id: taskId } });
  if (task.ownerId !== actorId) throw new ForbiddenError("เฉพาะเจ้าของงานเท่านั้นที่เริ่มงานนี้ได้");
  assertTransition(task.status, "IN_PROGRESS");

  return prisma.$transaction(async (tx) => {
    const updated = await tx.task.update({
      where: { id: taskId },
      data: { status: "IN_PROGRESS", startedAt: new Date() },
    });
    await logActivity(tx, {
      campaignId: task.campaignId,
      taskId,
      actorId,
      eventType: "TASK_STARTED",
    });
    return updated;
  });
}

const MY_WORK_TASK_INCLUDE = {
  campaign: { select: { id: true, name: true } },
  dependents: {
    include: {
      task: { select: { id: true, name: true, status: true, ownerId: true, owner: { select: { name: true } } } },
    },
  },
} as const;

export async function getMyWork(userId: string) {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const [ready, inProgress, revision, blocked, waitingApproval, completedToday] = await Promise.all([
    prisma.task.findMany({ where: { ownerId: userId, status: "READY" }, include: MY_WORK_TASK_INCLUDE, orderBy: { dueDate: "asc" } }),
    prisma.task.findMany({ where: { ownerId: userId, status: "IN_PROGRESS" }, include: MY_WORK_TASK_INCLUDE, orderBy: { dueDate: "asc" } }),
    prisma.task.findMany({ where: { ownerId: userId, status: "REVISION" }, include: MY_WORK_TASK_INCLUDE, orderBy: { dueDate: "asc" } }),
    prisma.task.findMany({ where: { ownerId: userId, status: "BLOCKED" }, include: MY_WORK_TASK_INCLUDE, orderBy: { dueDate: "asc" } }),
    prisma.task.findMany({ where: { approverId: userId, status: "REVIEW" }, include: MY_WORK_TASK_INCLUDE, orderBy: { submittedAt: "asc" } }),
    prisma.task.findMany({
      where: { ownerId: userId, status: "COMPLETED", completedAt: { gte: startOfToday } },
      include: MY_WORK_TASK_INCLUDE,
      orderBy: { completedAt: "desc" },
    }),
  ]);

  const overdue = [...ready, ...inProgress, ...revision].filter(
    (t) => t.dueDate && t.dueDate.getTime() < Date.now()
  );

  return { ready, inProgress, revision, blocked, waitingApproval, completedToday, overdue };
}

export async function reassignTask(
  taskId: string,
  actorId: string,
  changes: { ownerId?: string | null; approverId?: string | null }
) {
  const task = await prisma.task.findUniqueOrThrow({ where: { id: taskId } });

  return prisma.$transaction(async (tx) => {
    const updated = await tx.task.update({ where: { id: taskId }, data: changes });

    await logActivity(tx, {
      campaignId: task.campaignId,
      taskId,
      actorId,
      eventType: "TASK_ASSIGNED",
      metadata: changes,
    });

    if (changes.ownerId && changes.ownerId !== task.ownerId) {
      await notify(tx, {
        userId: changes.ownerId,
        type: "TASK_ASSIGNED",
        campaignId: task.campaignId,
        taskId,
        title: "คุณได้รับมอบหมายงาน",
        message: `ตอนนี้คุณเป็นเจ้าของงาน "${task.name}"`,
      });
    }

    return updated;
  });
}
