"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/server/auth";
import * as subtaskService from "@/server/services/subtask.service";
import type { TaskPriority } from "@prisma/client";

export type ActionState = { error?: string } | undefined;

export async function createSubtaskAction(
  taskId: string,
  campaignId: string,
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const user = await requireUser();
  const title = String(formData.get("title") ?? "").trim();
  if (!title) return { error: "กรุณากรอกชื่อซับทาสก์" };

  const assigneeId = formData.get("assigneeId") ? String(formData.get("assigneeId")) : null;
  const priorityRaw = formData.get("priority") ? String(formData.get("priority")) : null;
  const priority = (priorityRaw as TaskPriority | null) || null;

  await subtaskService.createSubtask({ taskId, title, assigneeId, priority, createdBy: user.id });

  revalidatePath(`/tasks/${taskId}`);
  revalidatePath(`/campaigns/${campaignId}`);
  return undefined;
}

export async function toggleSubtaskAction(subtaskId: string, taskId: string) {
  await requireUser();
  await subtaskService.toggleSubtask(subtaskId);
  revalidatePath(`/tasks/${taskId}`);
}

export async function deleteSubtaskAction(subtaskId: string, taskId: string) {
  const user = await requireUser();
  await subtaskService.deleteSubtask(subtaskId, user.id);
  revalidatePath(`/tasks/${taskId}`);
}
