"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/server/auth";
import * as approvalService from "@/server/services/approval.service";

export type ActionState = { error?: string } | undefined;

function paths(taskId: string, campaignId: string) {
  revalidatePath(`/tasks/${taskId}`);
  revalidatePath(`/campaigns/${campaignId}`);
  revalidatePath("/my-work");
  revalidatePath("/approvals");
}

export async function submitTaskAction(taskId: string, campaignId: string): Promise<ActionState> {
  const user = await requireUser();
  try {
    await approvalService.submitTask(taskId, user.id);
  } catch (err) {
    if (err instanceof Error) return { error: err.message };
    throw err;
  }
  paths(taskId, campaignId);
}

export async function approveTaskAction(taskId: string, campaignId: string, comment: string): Promise<ActionState> {
  const user = await requireUser();
  try {
    await approvalService.approveTask(taskId, user.id, comment || undefined);
  } catch (err) {
    if (err instanceof Error) return { error: err.message };
    throw err;
  }
  paths(taskId, campaignId);
}

export async function requestRevisionAction(taskId: string, campaignId: string, comment: string): Promise<ActionState> {
  const user = await requireUser();
  try {
    await approvalService.requestRevision(taskId, user.id, comment);
  } catch (err) {
    if (err instanceof Error) return { error: err.message };
    throw err;
  }
  paths(taskId, campaignId);
}

export async function resumeAfterRevisionAction(taskId: string, campaignId: string): Promise<ActionState> {
  const user = await requireUser();
  try {
    await approvalService.resumeAfterRevision(taskId, user.id);
  } catch (err) {
    if (err instanceof Error) return { error: err.message };
    throw err;
  }
  paths(taskId, campaignId);
}
