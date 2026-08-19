"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/server/auth";
import { setBoardStage } from "@/server/services/task.service";
import type { BoardStage } from "@prisma/client";

export async function moveBoardStageAction(taskId: string, campaignId: string, stage: BoardStage) {
  await requireUser();
  await setBoardStage(taskId, stage);
  revalidatePath(`/campaigns/${campaignId}/board`);
}
