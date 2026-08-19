"use client";

import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { Avatar } from "@/components/avatar";
import {
  updateUserRoleAction,
  updateUserTeamAction,
  toggleUserApproverAction,
  toggleUserActiveAction,
  deleteUserAction,
} from "@/app/actions/user";
import type { UserRole } from "@prisma/client";

type Team = { id: string; name: string };
type Row = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isApprover: boolean;
  active: boolean;
  team: Team | null;
};

const ROLE_LABELS: Record<UserRole, string> = {
  ADMIN: "ผู้ดูแลระบบ",
  MANAGER: "ผู้จัดการ",
  MEMBER: "สมาชิก",
};

export function UserManagementTable({
  users,
  teams,
  currentUserId,
}: {
  users: Row[];
  teams: Team[];
  currentUserId: string;
}) {
  const [pending, startTransition] = useTransition();
  const [deleteError, setDeleteError] = useState<{ id: string; message: string } | null>(null);

  function handleDelete(u: Row) {
    if (!window.confirm(`ลบผู้ใช้ "${u.name}" ใช่หรือไม่? การกระทำนี้ย้อนกลับไม่ได้`)) return;
    setDeleteError(null);
    startTransition(async () => {
      const res = await deleteUserAction(u.id);
      if (res?.error) setDeleteError({ id: u.id, message: res.error });
    });
  }

  return (
    <div className="overflow-x-auto rounded-[17px] border border-line bg-white">
      <table className="w-full min-w-[820px] border-collapse text-[11px]">
        <thead>
          <tr className="border-b border-line text-left text-[9px] font-extrabold uppercase tracking-wide text-muted">
            <th className="px-4 py-3">ผู้ใช้</th>
            <th className="px-4 py-3">บทบาท</th>
            <th className="px-4 py-3">ทีม</th>
            <th className="px-4 py-3">อนุมัติงานได้</th>
            <th className="px-4 py-3">สถานะ</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody>
          {users.map((u) => {
            const isSelf = u.id === currentUserId;
            return (
              <tr key={u.id} className="border-b border-[#f0f3f6] last:border-b-0 hover:bg-[#f9fbfd]">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <Avatar name={u.name} size={28} />
                    <div>
                      <div className="font-bold">{u.name}</div>
                      <div className="text-[10px] text-muted">{u.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <select
                    defaultValue={u.role}
                    disabled={pending || isSelf}
                    onChange={(e) => startTransition(() => updateUserRoleAction(u.id, e.target.value as UserRole))}
                    className="h-9 rounded-[9px] border border-line px-2 text-[11px] disabled:opacity-50"
                  >
                    {(Object.keys(ROLE_LABELS) as UserRole[]).map((r) => (
                      <option key={r} value={r}>
                        {ROLE_LABELS[r]}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-3">
                  <select
                    defaultValue={u.team?.id ?? ""}
                    disabled={pending}
                    onChange={(e) => startTransition(() => updateUserTeamAction(u.id, e.target.value || null))}
                    className="h-9 rounded-[9px] border border-line px-2 text-[11px]"
                  >
                    <option value="">ไม่มีทีม</option>
                    {teams.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    defaultChecked={u.isApprover}
                    disabled={pending}
                    onChange={(e) => startTransition(() => toggleUserApproverAction(u.id, e.target.checked))}
                    className="h-4 w-4 accent-[#2a81bc]"
                  />
                </td>
                <td className="px-4 py-3">
                  <button
                    disabled={pending || isSelf}
                    onClick={() => startTransition(() => toggleUserActiveAction(u.id, !u.active))}
                    className={
                      u.active
                        ? "rounded-lg bg-green-soft px-2 py-1 text-[9px] font-extrabold uppercase tracking-wide text-green disabled:opacity-50"
                        : "rounded-lg bg-[#edf1f5] px-2 py-1 text-[9px] font-extrabold uppercase tracking-wide text-[#6f7b8d] disabled:opacity-50"
                    }
                  >
                    {u.active ? "ใช้งานอยู่" : "ปิดใช้งาน"}
                  </button>
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    disabled={pending || isSelf}
                    onClick={() => handleDelete(u)}
                    aria-label="ลบผู้ใช้"
                    className="grid h-8 w-8 place-items-center rounded-lg border border-line text-[#b14a4a] hover:bg-red-soft disabled:opacity-40"
                  >
                    <Trash2 size={13} />
                  </button>
                  {deleteError?.id === u.id && (
                    <p className="mt-1 max-w-[220px] text-right text-[9px] font-semibold text-red">{deleteError.message}</p>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
