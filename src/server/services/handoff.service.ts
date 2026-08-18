import "server-only";
import type { Prisma, PrismaClient } from "@prisma/client";
import { prisma } from "@/server/db";
import { assertTransition } from "@/server/services/task.service";
import { logActivity } from "@/server/services/activity.service";
import { notify } from "@/server/services/notification.service";

type Tx = PrismaClient | Prisma.TransactionClient;

/**
 * The automatic handoff engine (spec §19). Must run inside a transaction.
 * Idempotent: if the task is already COMPLETED, this is a no-op.
 */
export async function completeTaskCore(tx: Tx, taskId: string, actorId?: string | null) {
  const task = await tx.task.findUniqueOrThrow({ where: { id: taskId } });
  if (task.status === "COMPLETED") return task;

  assertTransition(task.status, "COMPLETED");

  const updateResult = await tx.task.updateMany({
    where: { id: taskId, status: { not: "COMPLETED" } },
    data: {
      status: "COMPLETED",
      completedAt: new Date(),
      blockedReason: null,
      blockedNote: null,
      blockedAt: null,
    },
  });
  if (updateResult.count === 0) {
    // Lost a race with a concurrent completion — treat as already done.
    return tx.task.findUniqueOrThrow({ where: { id: taskId } });
  }

  await logActivity(tx, {
    campaignId: task.campaignId,
    taskId,
    actorId,
    eventType: "TASK_COMPLETED",
    metadata: { name: task.name },
  });

  const downstreamDeps = await tx.taskDependency.findMany({
    where: { dependsOnTaskId: taskId },
    select: { taskId: true },
  });

  for (const { taskId: downstreamId } of downstreamDeps) {
    const downstream = await tx.task.findUniqueOrThrow({ where: { id: downstreamId } });
    if (downstream.status !== "BLOCKED") continue;

    const deps = await tx.taskDependency.findMany({
      where: { taskId: downstreamId },
      select: { dependsOnTask: { select: { status: true } } },
    });
    const allCompleted = deps.every((d) => d.dependsOnTask.status === "COMPLETED");
    if (!allCompleted) continue;

    const unblockResult = await tx.task.updateMany({
      where: { id: downstreamId, status: "BLOCKED" },
      data: { status: "READY" },
    });
    if (unblockResult.count === 0) continue; // already unblocked concurrently

    // Standalone tasks (campaignId null) can never have TaskDependency edges — the
    // dependency picker only exists in campaign-scoped planning UI — so this branch
    // is unreachable for them. Guard is still explicit here to satisfy the type and
    // document the invariant.
    if (task.campaignId) {
      const existingHandoff = await tx.taskHandoff.findUnique({
        where: { fromTaskId_toTaskId: { fromTaskId: taskId, toTaskId: downstreamId } },
      });
      if (!existingHandoff) {
        await tx.taskHandoff.create({
          data: {
            campaignId: task.campaignId,
            fromTaskId: taskId,
            toTaskId: downstreamId,
            fromUserId: task.ownerId,
            toUserId: downstream.ownerId ?? task.ownerId ?? actorId ?? "",
          },
        });
      }
    }

    await logActivity(tx, {
      campaignId: task.campaignId,
      taskId: downstreamId,
      actorId,
      eventType: "TASK_READY",
      metadata: { unblockedBy: task.name },
    });
    await logActivity(tx, {
      campaignId: task.campaignId,
      taskId: downstreamId,
      actorId,
      eventType: "TASK_HANDOFF",
      metadata: { fromTaskId: taskId, toTaskId: downstreamId },
    });

    if (downstream.ownerId) {
      await notify(tx, {
        userId: downstream.ownerId,
        type: "TASK_READY",
        campaignId: task.campaignId,
        taskId: downstreamId,
        title: "พร้อมเริ่มงาน",
        message: `${task.name} เสร็จสิ้นแล้ว คุณสามารถเริ่มงาน "${downstream.name}" ได้ตอนนี้`,
        dedupe: true,
      });
    }
  }

  if (task.campaignId) {
    await checkCampaignCompletionCore(tx, task.campaignId, actorId);
  }

  return tx.task.findUniqueOrThrow({ where: { id: taskId } });
}

export async function checkCampaignCompletionCore(tx: Tx, campaignId: string, actorId?: string | null) {
  const campaign = await tx.campaign.findUniqueOrThrow({ where: { id: campaignId } });
  if (campaign.status === "COMPLETED") return;

  const tasks = await tx.task.findMany({
    where: { campaignId, status: { not: "CANCELLED" } },
    select: { status: true },
  });
  if (tasks.length === 0) return;

  const allCompleted = tasks.every((t) => t.status === "COMPLETED");
  if (!allCompleted) return;

  const result = await tx.campaign.updateMany({
    where: { id: campaignId, status: { not: "COMPLETED" } },
    data: { status: "COMPLETED" },
  });
  if (result.count === 0) return;

  await logActivity(tx, {
    campaignId,
    actorId,
    eventType: "CAMPAIGN_COMPLETED",
  });

  await notify(tx, {
    userId: campaign.ownerId,
    type: "TASK_READY",
    campaignId,
    title: "แคมเปญเสร็จสิ้น",
    message: `"${campaign.name}" เสร็จสมบูรณ์แล้ว — งานทั้งหมดเรียบร้อย`,
  });
}

/** Standalone entry point (e.g. "Complete Task" button when there's no approver). */
export async function completeTask(taskId: string, actorId: string) {
  return prisma.$transaction((tx) => completeTaskCore(tx, taskId, actorId));
}
