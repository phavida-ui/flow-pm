"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/server/auth";
import * as userService from "@/server/services/user.service";
import type { UserRole } from "@prisma/client";

export type ActionState = { error?: string } | undefined;

export async function createUserAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireRole("ADMIN");

  const name = String(formData.get("name") ?? "").trim();
  const title = formData.get("title") ? String(formData.get("title")) : null;
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const role = String(formData.get("role") ?? "MEMBER") as UserRole;
  const teamId = formData.get("teamId") ? String(formData.get("teamId")) : null;
  const isApprover = formData.get("isApprover") === "on";

  if (!name || !email || !password) return { error: "กรุณากรอกชื่อ อีเมล และรหัสผ่าน" };
  if (password.length < 8) return { error: "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร" };

  try {
    await userService.createUser({ name, title, email, password, role, teamId, isApprover });
  } catch (err) {
    if (err instanceof Error) return { error: err.message };
    throw err;
  }

  revalidatePath("/admin/users");
  return undefined;
}

export async function updateUserTitleAction(userId: string, title: string) {
  await requireRole("ADMIN");
  await userService.updateUser(userId, { title: title.trim() || null });
  revalidatePath("/admin/users");
}

export async function updateUserRoleAction(userId: string, role: UserRole) {
  await requireRole("ADMIN");
  await userService.updateUser(userId, { role });
  revalidatePath("/admin/users");
}

export async function updateUserTeamAction(userId: string, teamId: string | null) {
  await requireRole("ADMIN");
  await userService.updateUser(userId, { teamId });
  revalidatePath("/admin/users");
}

export async function toggleUserApproverAction(userId: string, isApprover: boolean) {
  await requireRole("ADMIN");
  await userService.updateUser(userId, { isApprover });
  revalidatePath("/admin/users");
}

export async function toggleUserActiveAction(userId: string, active: boolean) {
  await requireRole("ADMIN");
  await userService.updateUser(userId, { active });
  revalidatePath("/admin/users");
}

export type DeleteUserResult = { error?: string; needsReplacement?: boolean };

export async function deleteUserAction(userId: string, replacementUserId?: string): Promise<DeleteUserResult> {
  const actor = await requireRole("ADMIN");
  if (actor.id === userId) return { error: "ลบบัญชีของตัวเองไม่ได้" };

  try {
    await userService.deleteUser(userId, replacementUserId);
  } catch (err) {
    if (err instanceof Error && err.message === "HAS_RELATED_DATA") {
      return { needsReplacement: true };
    }
    if (err instanceof Error) return { error: err.message };
    throw err;
  }

  revalidatePath("/admin/users");
  return {};
}

export async function createTeamAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireRole("ADMIN");
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { error: "กรุณากรอกชื่อทีม" };

  try {
    await userService.createTeam(name);
  } catch (err) {
    if (err instanceof Error) return { error: err.message };
    throw err;
  }

  revalidatePath("/admin/users");
  return undefined;
}
