import "server-only";
import { prisma } from "@/server/db";
import { hashPassword } from "@/server/auth";
import type { UserRole } from "@prisma/client";

export async function listUsers() {
  return prisma.user.findMany({
    include: { team: { select: { id: true, name: true } } },
    orderBy: { name: "asc" },
  });
}

export async function listTeams() {
  return prisma.team.findMany({ orderBy: { name: "asc" } });
}

export async function createUser(params: {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  teamId?: string | null;
  isApprover: boolean;
}) {
  const existing = await prisma.user.findUnique({ where: { email: params.email } });
  if (existing) throw new Error("มีบัญชีที่ใช้อีเมลนี้อยู่แล้ว");

  const passwordHash = await hashPassword(params.password);
  return prisma.user.create({
    data: {
      name: params.name,
      email: params.email,
      passwordHash,
      role: params.role,
      teamId: params.teamId ?? null,
      isApprover: params.isApprover,
    },
  });
}

export async function updateUser(
  userId: string,
  data: Partial<{
    name: string;
    role: UserRole;
    teamId: string | null;
    isApprover: boolean;
    active: boolean;
  }>
) {
  return prisma.user.update({ where: { id: userId }, data });
}

export async function createTeam(name: string) {
  const existing = await prisma.team.findUnique({ where: { name } });
  if (existing) throw new Error("มีทีมชื่อนี้อยู่แล้ว");
  return prisma.team.create({ data: { name } });
}
