import "server-only";
import type { Prisma, NotificationType, PrismaClient } from "@prisma/client";
import { prisma } from "@/server/db";

type Tx = PrismaClient | Prisma.TransactionClient;

export async function notify(
  db: Tx,
  params: {
    userId: string;
    type: NotificationType;
    campaignId?: string | null;
    taskId?: string | null;
    title: string;
    message: string;
    dedupe?: boolean;
  }
) {
  if (params.dedupe) {
    const existing = await db.notification.findFirst({
      where: { userId: params.userId, type: params.type, taskId: params.taskId ?? undefined, isRead: false },
    });
    if (existing) return existing;
  }

  return db.notification.create({
    data: {
      userId: params.userId,
      type: params.type,
      campaignId: params.campaignId ?? null,
      taskId: params.taskId ?? null,
      title: params.title,
      message: params.message,
    },
  });
}

export async function listNotifications(userId: string) {
  return prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
}

export async function unreadCount(userId: string) {
  return prisma.notification.count({ where: { userId, isRead: false } });
}

export async function markRead(notificationId: string, userId: string) {
  return prisma.notification.updateMany({
    where: { id: notificationId, userId },
    data: { isRead: true },
  });
}

export async function markAllRead(userId: string) {
  return prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true },
  });
}
