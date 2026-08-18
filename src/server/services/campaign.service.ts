import "server-only";
import { prisma } from "@/server/db";
import { ForbiddenError } from "@/server/auth";
import {
  hasCycle,
  computeUnblockedTaskIds,
  type DependencyEdge,
} from "@/server/services/dependency.service";
import { logActivity } from "@/server/services/activity.service";
import { notify } from "@/server/services/notification.service";
import { toSimpleStatus, SIMPLE_STATUS_ORDER, type SimpleStatus } from "@/lib/task-status";

export async function createCampaign(params: {
  name: string;
  description?: string;
  ownerId: string;
  workflowTemplateId?: string | null;
  targetDate?: Date | null;
  createdBy: string;
}) {
  const campaign = await prisma.campaign.create({
    data: {
      name: params.name,
      description: params.description,
      ownerId: params.ownerId,
      workflowTemplateId: params.workflowTemplateId ?? null,
      targetDate: params.targetDate ?? null,
      status: "PLANNING",
      createdBy: params.createdBy,
    },
  });

  await prisma.campaignMember.create({
    data: { campaignId: campaign.id, userId: params.ownerId, role: "OWNER" },
  });

  await logActivity(prisma, {
    campaignId: campaign.id,
    actorId: params.createdBy,
    eventType: "CAMPAIGN_CREATED",
    metadata: { name: campaign.name },
  });

  if (params.workflowTemplateId) {
    await applyTemplate(campaign.id, params.workflowTemplateId, params.createdBy);
  }

  return campaign;
}

export async function applyTemplate(campaignId: string, templateId: string, actorId: string) {
  const templateTasks = await prisma.workflowTemplateTask.findMany({
    where: { templateId },
    orderBy: { sequence: "asc" },
  });
  const templateDeps = await prisma.workflowTemplateDependency.findMany({
    where: { taskId: { in: templateTasks.map((t) => t.id) } },
  });

  const idMap = new Map<string, string>();

  await prisma.$transaction(async (tx) => {
    for (const tt of templateTasks) {
      const dueDate = tt.defaultDurationDays
        ? new Date(Date.now() + tt.defaultDurationDays * 24 * 60 * 60 * 1000)
        : null;
      const task = await tx.task.create({
        data: {
          campaignId,
          templateTaskId: tt.id,
          name: tt.name,
          description: tt.description,
          teamId: tt.defaultTeamId,
          ownerId: tt.defaultOwnerId,
          approverId: tt.defaultApproverId,
          dueDate,
          status: "PLANNED",
          createdBy: actorId,
        },
      });
      idMap.set(tt.id, task.id);
    }

    for (const dep of templateDeps) {
      const taskId = idMap.get(dep.taskId);
      const dependsOnTaskId = idMap.get(dep.dependsOnTaskId);
      if (taskId && dependsOnTaskId) {
        await tx.taskDependency.create({ data: { taskId, dependsOnTaskId } });
      }
    }
  });

  return idMap;
}

export async function addMember(campaignId: string, userId: string, role: "MANAGER" | "MEMBER" | "APPROVER" = "MEMBER") {
  return prisma.campaignMember.upsert({
    where: { campaignId_userId: { campaignId, userId } },
    update: { role },
    create: { campaignId, userId, role },
  });
}

export type ReadyCheckResult = {
  passed: boolean;
  checks: {
    hasOwner: boolean;
    hasTargetDate: boolean;
    allTasksHaveOwner: boolean;
    allTasksHaveDueDate: boolean;
    noDependencyCycles: boolean;
    atLeastOneStartable: boolean;
  };
  stats: { taskCount: number; peopleCount: number; teamCount: number };
};

export async function runReadyCheck(campaignId: string): Promise<ReadyCheckResult> {
  const campaign = await prisma.campaign.findUniqueOrThrow({ where: { id: campaignId } });
  const tasks = await prisma.task.findMany({
    where: { campaignId, status: { not: "CANCELLED" } },
  });
  const deps: DependencyEdge[] = await prisma.taskDependency.findMany({
    where: { taskId: { in: tasks.map((t) => t.id) } },
    select: { taskId: true, dependsOnTaskId: true },
  });

  const hasOwner = Boolean(campaign.ownerId);
  const hasTargetDate = Boolean(campaign.targetDate);
  const allTasksHaveOwner = tasks.every((t) => Boolean(t.ownerId));
  const allTasksHaveDueDate = tasks.every((t) => Boolean(t.dueDate));
  const noDependencyCycles = !hasCycle(deps);

  const depsByTask = new Map<string, number>();
  for (const t of tasks) depsByTask.set(t.id, 0);
  for (const e of deps) depsByTask.set(e.taskId, (depsByTask.get(e.taskId) ?? 0) + 1);
  const atLeastOneStartable = tasks.length > 0 && tasks.some((t) => (depsByTask.get(t.id) ?? 0) === 0);

  const peopleCount = new Set(
    [...tasks.map((t) => t.ownerId), ...tasks.map((t) => t.approverId), campaign.ownerId].filter(Boolean)
  ).size;
  const teamCount = new Set(tasks.map((t) => t.teamId).filter(Boolean)).size;

  const checks = {
    hasOwner,
    hasTargetDate,
    allTasksHaveOwner,
    allTasksHaveDueDate,
    noDependencyCycles,
    atLeastOneStartable,
  };

  return {
    passed: Object.values(checks).every(Boolean),
    checks,
    stats: { taskCount: tasks.length, peopleCount, teamCount },
  };
}

export async function startCampaign(campaignId: string, actorId: string) {
  const campaign = await prisma.campaign.findUniqueOrThrow({ where: { id: campaignId } });
  if (!["PLANNING", "READY_TO_START"].includes(campaign.status)) {
    throw new Error(`ไม่สามารถเริ่มแคมเปญจากสถานะ ${campaign.status} ได้`);
  }

  const readyCheck = await runReadyCheck(campaignId);
  if (!readyCheck.passed) {
    throw new Error("ตรวจความพร้อมไม่ผ่าน — กรุณาแก้ไขปัญหาที่เหลือก่อนเริ่มแคมเปญ");
  }

  const tasks = await prisma.task.findMany({ where: { campaignId, status: "PLANNED" } });
  const deps: DependencyEdge[] = await prisma.taskDependency.findMany({
    where: { taskId: { in: tasks.map((t) => t.id) } },
    select: { taskId: true, dependsOnTaskId: true },
  });
  const startable = computeUnblockedTaskIds(
    tasks.map((t) => t.id),
    deps,
    new Set() // nothing completed yet
  );

  return prisma.$transaction(async (tx) => {
    for (const task of tasks) {
      const nextStatus = startable.has(task.id) ? "READY" : "BLOCKED";
      await tx.task.update({ where: { id: task.id }, data: { status: nextStatus } });

      if (nextStatus === "READY" && task.ownerId) {
        await notify(tx, {
          userId: task.ownerId,
          type: "TASK_READY",
          campaignId,
          taskId: task.id,
          title: "พร้อมเริ่มงาน",
          message: `"${task.name}" พร้อมแล้ว — เริ่มได้เลยตอนนี้`,
          dedupe: true,
        });
      }
    }

    const updated = await tx.campaign.update({
      where: { id: campaignId },
      data: { status: "ACTIVE", startDate: campaign.startDate ?? new Date() },
    });

    await logActivity(tx, {
      campaignId,
      actorId,
      eventType: "CAMPAIGN_STARTED",
    });

    return updated;
  });
}

export async function listCampaignsForUser(userId: string, role: string) {
  const canSeeAll = role === "ADMIN" || role === "MANAGER";
  const campaigns = await prisma.campaign.findMany({
    where: canSeeAll ? {} : { members: { some: { userId } } },
    orderBy: { updatedAt: "desc" },
    include: {
      tasks: {
        where: { status: { not: "CANCELLED" } },
        select: {
          status: true,
          name: true,
          owner: { select: { name: true } },
          approver: { select: { name: true } },
        },
      },
    },
  });

  return campaigns.map((c) => {
    const total = c.tasks.length;
    const completed = c.tasks.filter((t) => t.status === "COMPLETED").length;
    const currentHolders = c.tasks.filter((t) => t.status === "IN_PROGRESS");
    const waitingApproval = c.tasks.filter((t) => t.status === "REVIEW");
    const next = c.tasks.find((t) => t.status === "BLOCKED" || t.status === "READY");

    return {
      id: c.id,
      name: c.name,
      status: c.status,
      targetDate: c.targetDate,
      progress: { completed, total },
      currentHolders,
      waitingApproval,
      next,
    };
  });
}

export async function getCampaignDetail(campaignId: string) {
  const campaign = await prisma.campaign.findUniqueOrThrow({
    where: { id: campaignId },
    include: {
      owner: { select: { id: true, name: true } },
      members: { include: { user: { select: { id: true, name: true, avatarUrl: true, isApprover: true } } } },
      tasks: { where: { status: { not: "CANCELLED" } }, select: { status: true } },
    },
  });

  const total = campaign.tasks.length;
  const completed = campaign.tasks.filter((t) => t.status === "COMPLETED").length;
  const holders = await getCampaignHolders(campaignId);

  const statusBreakdown = SIMPLE_STATUS_ORDER.reduce((acc, key) => {
    acc[key] = 0;
    return acc;
  }, {} as Record<SimpleStatus, number>);
  for (const t of campaign.tasks) {
    const simple = toSimpleStatus(t);
    if (simple) statusBreakdown[simple]++;
  }

  return { campaign, progress: { completed, total }, statusBreakdown, ...holders };
}

export async function getCampaignHolders(campaignId: string) {
  const tasks = await prisma.task.findMany({
    where: {
      campaignId,
      status: { in: ["IN_PROGRESS", "REVIEW"] },
    },
    include: { owner: { select: { id: true, name: true, avatarUrl: true } } },
  });

  return {
    currentWork: tasks.filter((t) => t.status === "IN_PROGRESS"),
    waitingApproval: tasks.filter((t) => t.status === "REVIEW"),
  };
}

export async function assertCampaignMember(campaignId: string, userId: string) {
  const member = await prisma.campaignMember.findUnique({
    where: { campaignId_userId: { campaignId, userId } },
  });
  if (!member) throw new ForbiddenError("คุณไม่ได้เป็นสมาชิกของแคมเปญนี้");
  return member;
}
