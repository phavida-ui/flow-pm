"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/server/db";
import { createSessionCookie, clearSessionCookie, verifyPassword } from "@/server/auth";

export type LoginState = { error?: string } | undefined;

export async function loginAction(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "กรุณากรอกอีเมลและรหัสผ่าน" };
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.active) {
    return { error: "ไม่พบบัญชีที่ใช้อีเมลนี้" };
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    return { error: "รหัสผ่านไม่ถูกต้อง" };
  }

  await createSessionCookie(user.id);
  redirect("/my-work");
}

export async function logoutAction() {
  await clearSessionCookie();
  redirect("/login");
}
