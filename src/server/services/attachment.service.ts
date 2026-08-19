import "server-only";
import { prisma } from "@/server/db";
import { ForbiddenError } from "@/server/auth";

export async function addAttachment(taskId: string, uploadedBy: string, fileName: string, fileUrl: string) {
  return prisma.attachment.create({
    data: { taskId, uploadedBy, fileName, fileUrl },
  });
}

export async function listAttachments(taskId: string) {
  return prisma.attachment.findMany({
    where: { taskId },
    include: { uploader: { select: { id: true, name: true } } },
    orderBy: { createdAt: "asc" },
  });
}

export async function removeAttachment(attachmentId: string, actorId: string) {
  const attachment = await prisma.attachment.findUniqueOrThrow({ where: { id: attachmentId } });
  if (attachment.uploadedBy !== actorId) {
    throw new ForbiddenError("เฉพาะผู้แนบลิงก์นี้เท่านั้นที่ลบได้");
  }
  return prisma.attachment.delete({ where: { id: attachmentId } });
}
