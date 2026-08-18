"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireRole } from "@/server/auth";
import { prisma } from "@/server/db";

export type ActionState = { error?: string } | undefined;

export async function createTemplateAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireRole("ADMIN", "MANAGER");
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { error: "Template name is required." };

  const template = await prisma.workflowTemplate.create({
    data: { name, description: String(formData.get("description") ?? "") || null, createdBy: user.id },
  });

  revalidatePath("/workflows");
  redirect(`/workflows/${template.id}`);
}

export async function addTemplateTaskAction(templateId: string, formData: FormData) {
  await requireRole("ADMIN", "MANAGER");
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;

  const count = await prisma.workflowTemplateTask.count({ where: { templateId } });
  await prisma.workflowTemplateTask.create({
    data: {
      templateId,
      name,
      defaultTeamId: formData.get("teamId") ? String(formData.get("teamId")) : null,
      defaultDurationDays: formData.get("durationDays") ? Number(formData.get("durationDays")) : null,
      sequence: count + 1,
    },
  });
  revalidatePath(`/workflows/${templateId}`);
}

export async function deleteTemplateTaskAction(templateId: string, taskId: string) {
  await requireRole("ADMIN", "MANAGER");
  await prisma.workflowTemplateTask.delete({ where: { id: taskId } });
  revalidatePath(`/workflows/${templateId}`);
}

export async function addTemplateDependencyAction(templateId: string, taskId: string, dependsOnTaskId: string) {
  await requireRole("ADMIN", "MANAGER");
  if (taskId === dependsOnTaskId) return;
  await prisma.workflowTemplateDependency.create({ data: { taskId, dependsOnTaskId } }).catch(() => null);
  revalidatePath(`/workflows/${templateId}`);
}

export async function removeTemplateDependencyAction(templateId: string, dependencyId: string) {
  await requireRole("ADMIN", "MANAGER");
  await prisma.workflowTemplateDependency.delete({ where: { id: dependencyId } });
  revalidatePath(`/workflows/${templateId}`);
}

export async function deleteTemplateAction(templateId: string) {
  await requireRole("ADMIN", "MANAGER");
  await prisma.workflowTemplate.delete({ where: { id: templateId } });
  revalidatePath("/workflows");
  redirect("/workflows");
}
