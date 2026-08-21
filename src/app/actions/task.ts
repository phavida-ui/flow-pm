"use server";

import { revalidatePath } from "next/cache";
import { requireUser, isManagerOrAdmin, ForbiddenError } from "@/server/auth";
import { prisma } from "@/server/db";
import * as taskService from "@/server/services/task.service";
import * as dependencyService from "@/server/services/dependency.service";
import * as attachmentService from "@/server/services/attachment.service";
import { isValidHttpUrl } from "@/lib/url";

function readAttachment(formData: FormData): { error?: string; fileName?: string; fileUrl?: string } {
  const fileUrl = String(formData.get("attachmentUrl") ?? "").trim();
  if (!fileUrl) return {};
  if (!isValidHttpUrl(fileUrl)) return { error: "ลิงก์ไม่ถูกต้อง กรุณาใส่ URL ที่ขึ้นต้นด้วย http:// หรือ https://" };
  const fileName = String(formData.get("attachmentName") ?? "").trim() || fileUrl;
  return { fileName, fileUrl };
}

export type ActionState = { error?: string } | undefined;

async function assertPlanningEditable(campaignId: string) {
  const campaign = await prisma.campaign.findUniqueOrThrow({ where: { id: campaignId } });
  if (campaign.status !== "PLANNING" && campaign.status !== "DRAFT") {
    throw new ForbiddenError("เพิ่มหรือลบงานได้เฉพาะตอนที่แคมเปญอยู่ในสถานะกำลังวางแผนเท่านั้น");
  }
  return campaign;
}

export async function createTaskAction(campaignId: string | null, _prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser();
  try {
    if (campaignId) await assertPlanningEditable(campaignId);

    const name = String(formData.get("name") ?? "").trim();
    if (!name) return { error: "กรุณากรอกชื่องาน" };

    const attachment = readAttachment(formData);
    if (attachment.error) return { error: attachment.error };

    const dueDateRaw = formData.get("dueDate");
    const dependsOn = formData.get("dependsOn") ? String(formData.get("dependsOn")) : null;
    const description = formData.get("description") ? String(formData.get("description")) : undefined;

    const priorityRaw = formData.get("priority") ? String(formData.get("priority")) : null;

    const task = await taskService.createTask({
      campaignId,
      name,
      description,
      teamId: formData.get("teamId") ? String(formData.get("teamId")) : null,
      ownerId: formData.get("ownerId") ? String(formData.get("ownerId")) : user.id,
      approverId: formData.get("approverId") ? String(formData.get("approverId")) : null,
      dueDate: dueDateRaw ? new Date(String(dueDateRaw)) : null,
      priority: (priorityRaw as "LOW" | "MEDIUM" | "HIGH" | "URGENT" | null) || null,
      createdBy: user.id,
    });

    if (dependsOn && campaignId) {
      await dependencyService.addDependency(campaignId, task.id, dependsOn);
    }

    if (attachment.fileUrl) {
      await attachmentService.addAttachment(task.id, user.id, attachment.fileName!, attachment.fileUrl);
    }
  } catch (err) {
    if (err instanceof Error) return { error: err.message };
    throw err;
  }

  if (campaignId) revalidatePath(`/campaigns/${campaignId}`);
  revalidatePath("/my-work");
  return undefined;
}

export async function quickAddTaskAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser();
  const name = String(formData.get("title") ?? "").trim();
  if (!name) return { error: "กรุณากรอกชื่องาน" };

  const campaignId = formData.get("campaignId") ? String(formData.get("campaignId")) : null;
  if (campaignId) await assertPlanningEditable(campaignId);

  const attachment = readAttachment(formData);
  if (attachment.error) return { error: attachment.error };

  const priorityRaw = formData.get("priority") ? String(formData.get("priority")) : null;
  const dueDateRaw = formData.get("dueDate") ? String(formData.get("dueDate")) : null;
  const description = formData.get("description") ? String(formData.get("description")) : undefined;

  try {
    const task = await taskService.createTask({
      campaignId,
      name,
      description,
      ownerId: formData.get("ownerId") ? String(formData.get("ownerId")) : user.id,
      dueDate: dueDateRaw ? new Date(dueDateRaw) : null,
      priority: (priorityRaw as "LOW" | "MEDIUM" | "HIGH" | "URGENT" | null) || null,
      createdBy: user.id,
    });

    if (attachment.fileUrl) {
      await attachmentService.addAttachment(task.id, user.id, attachment.fileName!, attachment.fileUrl);
    }
  } catch (err) {
    if (err instanceof Error) return { error: err.message };
    throw err;
  }

  revalidatePath("/my-work");
  if (campaignId) revalidatePath(`/campaigns/${campaignId}`);
  return undefined;
}

export async function updateTaskAction(taskId: string, campaignId: string, _prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser();
  try {
    const priorityRaw = formData.get("priority") ? String(formData.get("priority")) : null;

    await taskService.updateTask(taskId, user.id, {
      name: formData.get("name") ? String(formData.get("name")) : undefined,
      description: formData.get("description") ? String(formData.get("description")) : null,
      teamId: formData.get("teamId") ? String(formData.get("teamId")) : null,
      ownerId: formData.get("ownerId") ? String(formData.get("ownerId")) : null,
      approverId: formData.get("approverId") ? String(formData.get("approverId")) : null,
      dueDate: formData.get("dueDate") ? new Date(String(formData.get("dueDate"))) : null,
      priority: (priorityRaw as "LOW" | "MEDIUM" | "HIGH" | "URGENT" | null) || null,
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

export async function startTaskAction(taskId: string, campaignId: string | null): Promise<ActionState> {
  const user = await requireUser();
  try {
    await taskService.startTask(taskId, user.id);
  } catch (err) {
    if (err instanceof Error) return { error: err.message };
    throw err;
  }
  revalidatePath(`/tasks/${taskId}`);
  if (campaignId) revalidatePath(`/campaigns/${campaignId}`);
  revalidatePath("/my-work");
}

export async function reassignTaskAction(
  taskId: string,
  campaignId: string | null,
  changes: { ownerId?: string | null; approverId?: string | null }
) {
  const user = await requireUser();
  if (!isManagerOrAdmin(user)) throw new ForbiddenError("เฉพาะผู้จัดการหรือผู้ดูแลระบบเท่านั้นที่มอบหมายงานใหม่ได้");
  await taskService.reassignTask(taskId, user.id, changes);
  revalidatePath(`/tasks/${taskId}`);
  if (campaignId) revalidatePath(`/campaigns/${campaignId}`);
}

export async function addCommentAction(taskId: string, campaignId: string | null, body: string) {
  const user = await requireUser();
  if (!body.trim()) return;
  await prisma.comment.create({ data: { taskId, userId: user.id, body: body.trim() } });
  revalidatePath(`/tasks/${taskId}`);
}
