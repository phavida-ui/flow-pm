import "server-only";
import { prisma } from "@/server/db";
import { ForbiddenError } from "@/server/auth";
import type { TaskPriority } from "@prisma/client";

export async function createSubtask(params: {
  taskId: string;
  title: string;
  assigneeId?: string | null;
  priority?: TaskPriority | null;
  createdBy: string;
}) {
  return prisma.subtask.create({
    data: {
      taskId: params.taskId,
      title: params.title,
      assigneeId: params.assigneeId ?? null,
      priority: params.priority ?? null,
      createdBy: params.createdBy,
    },
  });
}

export async function toggleSubtask(subtaskId: string) {
  const subtask = await prisma.subtask.findUniqueOrThrow({ where: { id: subtaskId } });
  const done = subtask.status !== "DONE";
  return prisma.subtask.update({
    where: { id: subtaskId },
    data: { status: done ? "DONE" : "TODO", completedAt: done ? new Date() : null },
  });
}

export async function deleteSubtask(subtaskId: string, actorId: string) {
  const subtask = await prisma.subtask.findUniqueOrThrow({ where: { id: subtaskId } });
  if (subtask.createdBy !== actorId && subtask.assigneeId !== actorId) {
    throw new ForbiddenError("เฉพาะผู้สร้างหรือผู้รับผิดชอบซับทาสก์นี้เท่านั้นที่ลบได้");
  }
  return prisma.subtask.delete({ where: { id: subtaskId } });
}

export async function listSubtasks(taskId: string) {
  return prisma.subtask.findMany({
    where: { taskId },
    include: { assignee: { select: { id: true, name: true } } },
    orderBy: { createdAt: "asc" },
  });
}
