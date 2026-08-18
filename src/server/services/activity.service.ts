import "server-only";
import type { Prisma, ActivityEventType, PrismaClient } from "@prisma/client";
import { prisma } from "@/server/db";

type Tx = PrismaClient | Prisma.TransactionClient;

export async function logActivity(
  db: Tx,
  params: {
    campaignId?: string | null;
    taskId?: string | null;
    actorId?: string | null;
    eventType: ActivityEventType;
    metadata?: Record<string, unknown>;
  }
) {
  return db.activityLog.create({
    data: {
      campaignId: params.campaignId ?? null,
      taskId: params.taskId ?? null,
      actorId: params.actorId ?? null,
      eventType: params.eventType,
      metadataJson: params.metadata as Prisma.InputJsonValue | undefined,
    },
  });
}

export async function getCampaignActivity(campaignId: string) {
  return prisma.activityLog.findMany({
    where: { campaignId },
    orderBy: { createdAt: "desc" },
    include: {
      actor: { select: { id: true, name: true, avatarUrl: true } },
      task: { select: { id: true, name: true } },
    },
  });
}
