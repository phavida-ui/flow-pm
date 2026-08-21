"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/server/auth";
import * as attachmentService from "@/server/services/attachment.service";
import { isValidHttpUrl } from "@/lib/url";

export type ActionState = { error?: string } | undefined;

export async function addAttachmentAction(
  taskId: string,
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const user = await requireUser();
  const fileUrl = String(formData.get("fileUrl") ?? "").trim();
  const fileName = String(formData.get("fileName") ?? "").trim() || fileUrl;

  if (!fileUrl) return { error: "กรุณาใส่ลิงก์" };
  if (!isValidHttpUrl(fileUrl)) return { error: "ลิงก์ไม่ถูกต้อง กรุณาใส่ URL ที่ขึ้นต้นด้วย http:// หรือ https://" };

  await attachmentService.addAttachment(taskId, user.id, fileName, fileUrl);
  revalidatePath(`/tasks/${taskId}`);
  return undefined;
}

export async function removeAttachmentAction(attachmentId: string, taskId: string) {
  const user = await requireUser();
  await attachmentService.removeAttachment(attachmentId, user.id);
  revalidatePath(`/tasks/${taskId}`);
}
