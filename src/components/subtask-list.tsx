"use client";

import { useActionState, useState, useTransition } from "react";
import { Plus, Trash2 } from "lucide-react";
import { PriorityBadge } from "@/components/priority-badge";
import { createSubtaskAction, toggleSubtaskAction, deleteSubtaskAction, type ActionState } from "@/app/actions/subtask";
import type { TaskPriority, SubtaskStatus } from "@prisma/client";

type Option = { id: string; name: string };
type SubtaskRow = {
  id: string;
  title: string;
  status: SubtaskStatus;
  priority: TaskPriority | null;
  assignee: { id: string; name: string } | null;
};

export function SubtaskList({
  taskId,
  campaignId,
  subtasks,
  users,
}: {
  taskId: string;
  campaignId: string | null;
  subtasks: SubtaskRow[];
  users: Option[];
}) {
  const boundCreate = createSubtaskAction.bind(null, taskId, campaignId);
  const [state, formAction, pending] = useActionState<ActionState, FormData>(boundCreate, undefined);
  const [, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function toggle(id: string) {
    startTransition(() => toggleSubtaskAction(id, taskId));
  }

  function remove(id: string) {
    setError(null);
    startTransition(async () => {
      try {
        await deleteSubtaskAction(id, taskId);
      } catch (err) {
        setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
      }
    });
  }

  return (
    <div className="rounded-[17px] border border-line bg-white p-5">
      <h3 className="mb-3 text-sm font-extrabold">ซับทาสก์</h3>

      <div className="mb-3 grid gap-2">
        {subtasks.length === 0 && <p className="text-[11px] text-muted">ยังไม่มีซับทาสก์</p>}
        {subtasks.map((s) => (
          <div key={s.id} className="flex items-center gap-2.5 rounded-[10px] border border-line px-3 py-2.5">
            <input
              type="checkbox"
              checked={s.status === "DONE"}
              onChange={() => toggle(s.id)}
              className="h-4 w-4 accent-[#2a81bc]"
            />
            <div className="flex-1">
              <div className={s.status === "DONE" ? "text-[12px] text-muted line-through" : "text-[12px]"}>
                {s.title}
              </div>
              <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-[9px] text-muted">
                {s.assignee && <span>{s.assignee.name}</span>}
                {s.priority && <PriorityBadge priority={s.priority} />}
              </div>
            </div>
            <button onClick={() => remove(s.id)} className="grid h-7 w-7 place-items-center rounded-lg text-[#b14a4a] hover:bg-red-soft" aria-label="ลบซับทาสก์">
              <Trash2 size={12} />
            </button>
          </div>
        ))}
      </div>

      <form action={formAction} className="grid grid-cols-[1fr_auto_auto_auto] gap-2">
        <input
          name="title"
          required
          placeholder="เพิ่มซับทาสก์…"
          className="h-9 rounded-[10px] border border-line px-3 text-[11px] outline-none focus:border-primary"
        />
        <select name="assigneeId" className="h-9 rounded-[10px] border border-line px-2 text-[11px]">
          <option value="">ไม่มอบหมาย</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name}
            </option>
          ))}
        </select>
        <select name="priority" className="h-9 rounded-[10px] border border-line px-2 text-[11px]">
          <option value="">ไม่ระบุ</option>
          <option value="LOW">ต่ำ</option>
          <option value="MEDIUM">ปานกลาง</option>
          <option value="HIGH">สูง</option>
          <option value="URGENT">ด่วน</option>
        </select>
        <button disabled={pending} className="grid h-9 w-9 place-items-center rounded-[10px] bg-primary text-[#173f5c] disabled:opacity-60" aria-label="เพิ่ม">
          <Plus size={14} />
        </button>
      </form>

      {(state?.error || error) && <p className="mt-2 text-[11px] font-semibold text-red">{state?.error ?? error}</p>}
    </div>
  );
}
