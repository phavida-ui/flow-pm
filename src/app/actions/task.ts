"use server";

import { revalidatePath } from "next/cache";
import { requireUser, isManagerOrAdmin, ForbiddenError } from "@/server/auth";
import { prisma } from "@/server/db";
import * as taskService from "@/server/services/task.service";
import * as dependencyService from "@/server/services/dependency.service";

export type ActionState = { error?: string } | undefined;

async function assertPlanningEditable(campaignId: string) {
  const campaign = await prisma.campaign.findUniqueOrThrow({ where: { id: campaignId } });
  if (campaign.status !== "PLANNING" && campaign.status !== "DRAFT") {
    throw new ForbiddenError("Tasks can only be added or removed while the campaign is in Planning.");
  }
  return campaign;
}

export async function createTaskAction(campaignId: string, _prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser();
  try {
    await assertPlanningEditable(campaignId);

    const name = String(formData.get("name") ?? "").trim();
    if (!name) return { error: "Task name is required." };

    const dueDateRaw = formData.get("dueDate");
    const dependsOn = formData.get("dependsOn") ? String(formData.get("dependsOn")) : null;

    const task = await taskService.createTask({
      campaignId,
      name,
      teamId: formData.get("teamId") ? String(formData.get("teamId")) : null,
      ownerId: formData.get("ownerId") ? String(formData.get("ownerId")) : user.id,
      approverId: formData.get("approverId") ? String(formData.get("approverId")) : null,
      dueDate: dueDateRaw ? new Date(String(dueDateRaw)) : null,
      createdBy: user.id,
    });

    if (dependsOn) {
      await dependencyService.addDependency(campaignId, task.id, dependsOn);
    }
  } catch (err) {
    if (err instanceof Error) return { error: err.message };
    throw err;
  }

  revalidatePath(`/campaigns/${campaignId}`);
  return undefined;
}

export async function updateTaskAction(taskId: string, campaignId: string, _prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser();
  try {
    await taskService.updateTask(taskId, user.id, {
      name: formData.get("name") ? String(formData.get("name")) : undefined,
      teamId: formData.get("teamId") ? String(formData.get("teamId")) : null,
      ownerId: formData.get("ownerId") ? String(formData.get("ownerId")) : null,
      approverId: formData.get("approverId") ? String(formData.get("approverId")) : null,
      dueDate: formData.get("dueDate") ? new Date(String(formData.get("dueDate"))) : null,
    });
  } catch (err) {
    if (err instanceof Error) return { error: err.message };
    throw err;
  }
  revalidatePath(`/campaigns/${campaignId}`);
  revalidatePath(`/tasks/${taskId}`);
  return undefined;
}

export async function deleteTaskAction(taskId: string, campaignId: string) {
  await requireUser();
  await assertPlanningEditable(campaignId);
  await taskService.deleteTask(taskId);
  revalidatePath(`/campaigns/${campaignId}`);
}

export async function addDependencyAction(taskId: string, campaignId: string, dependsOnTaskId: string) {
  await requireUser();
  await dependencyService.addDependency(campaignId, taskId, dependsOnTaskId);
  revalidatePath(`/campaigns/${campaignId}`);
  revalidatePath(`/tasks/${taskId}`);
}

export async function removeDependencyAction(dependencyId: string, campaignId: string, taskId: string) {
  await requireUser();
  await dependencyService.removeDependency(dependencyId);
  revalidatePath(`/campaigns/${campaignId}`);
  revalidatePath(`/tasks/${taskId}`);
}

export async function startTaskAction(taskId: string, campaignId: string): Promise<ActionState> {
  const user = await requireUser();
  try {
    await taskService.startTask(taskId, user.id);
  } catch (err) {
    if (err instanceof Error) return { error: err.message };
    throw err;
  }
  revalidatePath(`/tasks/${taskId}`);
  revalidatePath(`/campaigns/${campaignId}`);
  revalidatePath("/my-work");
}

export async function reassignTaskAction(
  taskId: string,
  campaignId: string,
  changes: { ownerId?: string | null; approverId?: string | null }
) {
  const user = await requireUser();
  if (!isManagerOrAdmin(user)) throw new ForbiddenError("Only managers or admins can reassign tasks");
  await taskService.reassignTask(taskId, user.id, changes);
  revalidatePath(`/tasks/${taskId}`);
  revalidatePath(`/campaigns/${campaignId}`);
}

export async function addCommentAction(taskId: string, campaignId: string, body: string) {
  const user = await requireUser();
  if (!body.trim()) return;
  await prisma.comment.create({ data: { taskId, userId: user.id, body: body.trim() } });
  revalidatePath(`/tasks/${taskId}`);
}
