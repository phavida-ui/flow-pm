"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/server/auth";
import * as userService from "@/server/services/user.service";

export type ActionState = { error?: string; success?: boolean } | undefined;

export async function updateOwnNameAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser();
  const name = String(formData.get("name") ?? "");

  try {
    await userService.updateOwnName(user.id, name);
  } catch (err) {
    if (err instanceof Error) return { error: err.message };
    throw err;
  }

  revalidatePath("/settings");
  return { success: true };
}

export async function changeOwnPasswordAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser();
  const currentPassword = String(formData.get("currentPassword") ?? "");
  const newPassword = String(formData.get("newPassword") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (!currentPassword || !newPassword) return { error: "กรุณากรอกรหัสผ่านปัจจุบันและรหัสผ่านใหม่" };
  if (newPassword.length < 8) return { error: "รหัสผ่านใหม่ต้องมีอย่างน้อย 8 ตัวอักษร" };
  if (newPassword !== confirmPassword) return { error: "รหัสผ่านใหม่ทั้งสองช่องไม่ตรงกัน" };

  try {
    await userService.changeOwnPassword(user.id, currentPassword, newPassword);
  } catch (err) {
    if (err instanceof Error) return { error: err.message };
    throw err;
  }

  return { success: true };
}
