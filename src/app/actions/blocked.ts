"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/server/auth";
import * as taskService from "@/server/services/task.service";
import type { TaskBlockedReason } from "@prisma/client";

export type ActionState = { error?: string } | undefined;

function paths(taskId: string, campaignId: string | null) {
  revalidatePath(`/tasks/${taskId}`);
  revalidatePath("/my-work");
  if (campaignId) revalidatePath(`/campaigns/${campaignId}`);
}

export async function markBlockedAction(
  taskId: string,
  campaignId: string | null,
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const user = await requireUser();
  const reason = String(formData.get("reason") ?? "") as TaskBlockedReason;
  if (!reason) return { error: "กรุณาเลือกสาเหตุ" };
  const note = formData.get("note") ? String(formData.get("note")) : null;

  try {
    await taskService.markTaskBlocked(taskId, user.id, reason, note);
  } catch (err) {
    if (err instanceof Error) return { error: err.message };
    throw err;
  }

  paths(taskId, campaignId);
  return undefined;
}

export async function clearBlockedAction(taskId: string, campaignId: string | null) {
  const user = await requireUser();
  await taskService.clearTaskBlocked(taskId, user.id);
  paths(taskId, campaignId);
}
