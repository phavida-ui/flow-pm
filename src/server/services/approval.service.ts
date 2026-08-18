import "server-only";
import { prisma } from "@/server/db";
import { ForbiddenError } from "@/server/auth";
import { assertTransition } from "@/server/services/task.service";
import { completeTaskCore } from "@/server/services/handoff.service";
import { logActivity } from "@/server/services/activity.service";
import { notify } from "@/server/services/notification.service";

export async function submitTask(taskId: string, actorId: string) {
  const task = await prisma.task.findUniqueOrThrow({ where: { id: taskId } });
  if (task.ownerId !== actorId) throw new ForbiddenError("เฉพาะคนรับผิดชอบงานเท่านั้นที่ส่งงานนี้ได้");

  if (!task.approverId) {
    // No approver required — submitting completes the task directly.
    return prisma.$transaction((tx) => completeTaskCore(tx, taskId, actorId));
  }

  assertTransition(task.status, "REVIEW");

  return prisma.$transaction(async (tx) => {
    const updated = await tx.task.update({
      where: { id: taskId },
      data: {
        status: "REVIEW",
        submittedAt: new Date(),
        blockedReason: null,
        blockedNote: null,
        blockedAt: null,
      },
    });

    await tx.approval.create({
      data: {
        taskId,
        approverId: task.approverId!,
        status: "PENDING",
        submittedAt: new Date(),
      },
    });

    await logActivity(tx, {
      campaignId: task.campaignId,
      taskId,
      actorId,
      eventType: "TASK_SUBMITTED",
    });

    await notify(tx, {
      userId: task.approverId!,
      type: "APPROVAL_REQUIRED",
      campaignId: task.campaignId,
      taskId,
      title: "มีคำขออนุมัติ",
      message: `"${task.name}" กำลังรอให้คุณตรวจสอบ`,
    });

    return updated;
  });
}

export async function approveTask(taskId: string, approverId: string, comment?: string) {
  const task = await prisma.task.findUniqueOrThrow({ where: { id: taskId } });
  if (task.approverId !== approverId) throw new ForbiddenError("เฉพาะผู้อนุมัติที่ได้รับมอบหมายเท่านั้นที่อนุมัติงานนี้ได้");
  if (task.status !== "REVIEW") throw new ForbiddenError("งานนี้ไม่ได้อยู่ในสถานะรอตรวจสอบ");

  return prisma.$transaction(async (tx) => {
    const pendingApproval = await tx.approval.findFirst({
      where: { taskId, approverId, status: "PENDING" },
      orderBy: { createdAt: "desc" },
    });
    if (pendingApproval) {
      await tx.approval.update({
        where: { id: pendingApproval.id },
        data: { status: "APPROVED", comment, reviewedAt: new Date() },
      });
    }

    await logActivity(tx, {
      campaignId: task.campaignId,
      taskId,
      actorId: approverId,
      eventType: "TASK_APPROVED",
    });

    return completeTaskCore(tx, taskId, approverId);
  });
}

export async function requestRevision(taskId: string, approverId: string, comment: string) {
  if (!comment.trim()) throw new Error("กรุณากรอกความคิดเห็นเมื่อขอให้แก้ไข");

  const task = await prisma.task.findUniqueOrThrow({ where: { id: taskId } });
  if (task.approverId !== approverId) throw new ForbiddenError("เฉพาะผู้อนุมัติที่ได้รับมอบหมายเท่านั้นที่ขอให้แก้ไขได้");
  if (task.status !== "REVIEW") throw new ForbiddenError("งานนี้ไม่ได้อยู่ในสถานะรอตรวจสอบ");

  assertTransition(task.status, "REVISION");

  return prisma.$transaction(async (tx) => {
    const pendingApproval = await tx.approval.findFirst({
      where: { taskId, approverId, status: "PENDING" },
      orderBy: { createdAt: "desc" },
    });
    if (pendingApproval) {
      await tx.approval.update({
        where: { id: pendingApproval.id },
        data: { status: "REVISION_REQUESTED", comment, reviewedAt: new Date() },
      });
    }

    const updated = await tx.task.update({
      where: { id: taskId },
      data: { status: "REVISION" },
    });

    await logActivity(tx, {
      campaignId: task.campaignId,
      taskId,
      actorId: approverId,
      eventType: "TASK_REVISION_REQUESTED",
      metadata: { comment },
    });

    if (task.ownerId) {
      await notify(tx, {
        userId: task.ownerId,
        type: "REVISION_REQUESTED",
        campaignId: task.campaignId,
        taskId,
        title: "มีการขอให้แก้ไข",
        message: `"${task.name}" ต้องแก้ไข: ${comment}`,
      });
    }

    return updated;
  });
}

export async function resumeAfterRevision(taskId: string, actorId: string) {
  const task = await prisma.task.findUniqueOrThrow({ where: { id: taskId } });
  if (task.ownerId !== actorId) throw new ForbiddenError("เฉพาะคนรับผิดชอบงานเท่านั้นที่ดำเนินงานนี้ต่อได้");
  assertTransition(task.status, "IN_PROGRESS");

  return prisma.task.update({ where: { id: taskId }, data: { status: "IN_PROGRESS" } });
}

export async function getApprovalInbox(approverId: string) {
  return prisma.task.findMany({
    where: { approverId, status: "REVIEW" },
    include: {
      campaign: { select: { id: true, name: true } },
      owner: { select: { id: true, name: true, avatarUrl: true } },
    },
    orderBy: { submittedAt: "asc" },
  });
}
