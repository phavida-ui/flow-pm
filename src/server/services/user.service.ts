import "server-only";
import { Prisma } from "@prisma/client";
import { prisma } from "@/server/db";
import { hashPassword, verifyPassword } from "@/server/auth";
import type { UserRole } from "@prisma/client";

export async function listUsers() {
  return prisma.user.findMany({
    include: { team: { select: { id: true, name: true } } },
    orderBy: { name: "asc" },
  });
}

export async function listTeams() {
  return prisma.team.findMany({ orderBy: { name: "asc" } });
}

export async function createUser(params: {
  name: string;
  title?: string | null;
  email: string;
  password: string;
  role: UserRole;
  teamId?: string | null;
  isApprover: boolean;
}) {
  const existing = await prisma.user.findUnique({ where: { email: params.email } });
  if (existing) throw new Error("มีบัญชีที่ใช้อีเมลนี้อยู่แล้ว");

  const passwordHash = await hashPassword(params.password);
  return prisma.user.create({
    data: {
      name: params.name,
      title: params.title?.trim() || null,
      email: params.email,
      passwordHash,
      role: params.role,
      teamId: params.teamId ?? null,
      isApprover: params.isApprover,
    },
  });
}

export async function updateUser(
  userId: string,
  data: Partial<{
    name: string;
    title: string | null;
    role: UserRole;
    teamId: string | null;
    isApprover: boolean;
    active: boolean;
  }>
) {
  return prisma.user.update({ where: { id: userId }, data });
}

export async function deleteUser(userId: string, replacementUserId?: string) {
  if (!replacementUserId) {
    try {
      await prisma.user.delete({ where: { id: userId } });
      return;
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2003") {
        throw new Error("HAS_RELATED_DATA");
      }
      throw err;
    }
  }

  if (replacementUserId === userId) throw new Error("ผู้รับช่วงงานต้องเป็นคนละคนกับผู้ใช้ที่จะลบ");
  const replacement = await prisma.user.findUnique({ where: { id: replacementUserId } });
  if (!replacement) throw new Error("ไม่พบผู้ใช้ที่จะรับช่วงงาน");

  await prisma.$transaction(async (tx) => {
    // Operational + historical references that must point to a real user get reassigned
    // to the replacement. Membership rows and the deleted user's own notifications are
    // just removed rather than transferred.
    await tx.campaign.updateMany({ where: { ownerId: userId }, data: { ownerId: replacementUserId } });
    await tx.campaign.updateMany({ where: { createdBy: userId }, data: { createdBy: replacementUserId } });
    await tx.workflowTemplate.updateMany({ where: { createdBy: userId }, data: { createdBy: replacementUserId } });
    await tx.workflowTemplateTask.updateMany({ where: { defaultOwnerId: userId }, data: { defaultOwnerId: replacementUserId } });
    await tx.workflowTemplateTask.updateMany({ where: { defaultApproverId: userId }, data: { defaultApproverId: replacementUserId } });
    await tx.task.updateMany({ where: { ownerId: userId }, data: { ownerId: replacementUserId } });
    await tx.task.updateMany({ where: { approverId: userId }, data: { approverId: replacementUserId } });
    await tx.task.updateMany({ where: { createdBy: userId }, data: { createdBy: replacementUserId } });
    await tx.subtask.updateMany({ where: { assigneeId: userId }, data: { assigneeId: replacementUserId } });
    await tx.subtask.updateMany({ where: { createdBy: userId }, data: { createdBy: replacementUserId } });
    await tx.approval.updateMany({ where: { approverId: userId }, data: { approverId: replacementUserId } });
    await tx.taskHandoff.updateMany({ where: { fromUserId: userId }, data: { fromUserId: replacementUserId } });
    await tx.taskHandoff.updateMany({ where: { toUserId: userId }, data: { toUserId: replacementUserId } });
    await tx.activityLog.updateMany({ where: { actorId: userId }, data: { actorId: replacementUserId } });
    await tx.comment.updateMany({ where: { userId }, data: { userId: replacementUserId } });
    await tx.attachment.updateMany({ where: { uploadedBy: userId }, data: { uploadedBy: replacementUserId } });

    await tx.campaignMember.deleteMany({ where: { userId } });
    await tx.notification.deleteMany({ where: { userId } });

    await tx.user.delete({ where: { id: userId } });
  });
}

export async function updateOwnName(userId: string, name: string) {
  const trimmed = name.trim();
  if (!trimmed) throw new Error("กรุณากรอกชื่อ");
  return prisma.user.update({ where: { id: userId }, data: { name: trimmed } });
}

export async function changeOwnPassword(userId: string, currentPassword: string, newPassword: string) {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  const valid = await verifyPassword(currentPassword, user.passwordHash);
  if (!valid) throw new Error("รหัสผ่านปัจจุบันไม่ถูกต้อง");

  const passwordHash = await hashPassword(newPassword);
  return prisma.user.update({ where: { id: userId }, data: { passwordHash } });
}

export async function createTeam(name: string) {
  const existing = await prisma.team.findUnique({ where: { name } });
  if (existing) throw new Error("มีทีมชื่อนี้อยู่แล้ว");
  return prisma.team.create({ data: { name } });
}
