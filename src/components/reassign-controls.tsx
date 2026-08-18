"use client";

import { useTransition } from "react";
import { reassignTaskAction } from "@/app/actions/task";

type Option = { id: string; name: string };

export function ReassignControls({
  taskId,
  campaignId,
  ownerId,
  approverId,
  users,
}: {
  taskId: string;
  campaignId: string | null;
  ownerId: string | null;
  approverId: string | null;
  users: Option[];
}) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="grid grid-cols-2 gap-3">
      <label className="grid gap-1.5">
        <span className="text-[9px] font-extrabold text-muted">คนรับผิดชอบ</span>
        <select
          defaultValue={ownerId ?? ""}
          disabled={pending}
          onChange={(e) => startTransition(() => reassignTaskAction(taskId, campaignId, { ownerId: e.target.value || null }))}
          className="h-9 rounded-[9px] border border-line px-2 text-[11px]"
        >
          <option value="">ยังไม่มอบหมาย</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name}
            </option>
          ))}
        </select>
      </label>
      <label className="grid gap-1.5">
        <span className="text-[9px] font-extrabold text-muted">ผู้อนุมัติ</span>
        <select
          defaultValue={approverId ?? ""}
          disabled={pending}
          onChange={(e) => startTransition(() => reassignTaskAction(taskId, campaignId, { approverId: e.target.value || null }))}
          className="h-9 rounded-[9px] border border-line px-2 text-[11px]"
        >
          <option value="">ไม่ต้องอนุมัติ</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
