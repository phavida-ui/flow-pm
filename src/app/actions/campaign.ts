"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser, requireRole, isManagerOrAdmin } from "@/server/auth";
import { prisma } from "@/server/db";
import * as campaignService from "@/server/services/campaign.service";

export type ActionState = { error?: string } | undefined;

export async function createCampaignAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireRole("ADMIN", "MANAGER");

  const name = String(formData.get("name") ?? "").trim();
  const ownerId = String(formData.get("ownerId") ?? "");
  const targetDate = formData.get("targetDate") ? new Date(String(formData.get("targetDate"))) : null;
  const workflowTemplateId = formData.get("workflowTemplateId") ? String(formData.get("workflowTemplateId")) : null;

  if (!name || !ownerId) return { error: "กรุณากรอกชื่อและคนรับผิดชอบ" };

  const campaign = await campaignService.createCampaign({
    name,
    ownerId,
    targetDate,
    workflowTemplateId,
    createdBy: user.id,
  });

  revalidatePath("/campaigns");
  redirect(`/campaigns/${campaign.id}`);
}

export async function addMemberAction(campaignId: string, userId: string, role: "MANAGER" | "MEMBER" | "APPROVER") {
  const user = await requireUser();
  if (!isManagerOrAdmin(user)) {
    await campaignService.assertCampaignMember(campaignId, user.id);
  }
  await campaignService.addMember(campaignId, userId, role);
  revalidatePath(`/campaigns/${campaignId}`);
}

export async function startCampaignAction(campaignId: string) {
  const user = await requireRole("ADMIN", "MANAGER");
  try {
    await campaignService.startCampaign(campaignId, user.id);
  } catch (err) {
    if (err instanceof Error) return { error: err.message };
    throw err;
  }
  revalidatePath(`/campaigns/${campaignId}`);
  redirect(`/campaigns/${campaignId}`);
}

export async function removeMemberAction(campaignId: string, userId: string) {
  const user = await requireRole("ADMIN", "MANAGER");
  await prisma.campaignMember.delete({ where: { campaignId_userId: { campaignId, userId } } });
  revalidatePath(`/campaigns/${campaignId}`);
}
