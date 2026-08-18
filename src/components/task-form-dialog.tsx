"use client";

import { useActionState, useState } from "react";
import { Plus, Pencil } from "lucide-react";
import { Dialog } from "@/components/dialog";
import { createTaskAction, updateTaskAction, type ActionState } from "@/app/actions/task";

type Option = { id: string; name: string };

export function TaskFormDialog({
  campaignId,
  teams,
  users,
  dependencyOptions,
  mode,
  task,
  lockOwnerTo,
}: {
  campaignId: string;
  teams: Option[];
  users: Option[];
  dependencyOptions: Option[];
  mode: "create" | "edit";
  task?: {
    id: string;
    name: string;
    teamId: string | null;
    ownerId: string | null;
    approverId: string | null;
    dueDate: Date | null;
    priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT" | null;
  };
  lockOwnerTo?: { id: string; name: string };
}) {
  const [open, setOpen] = useState(false);
  const boundAction =
    mode === "create"
      ? createTaskAction.bind(null, campaignId)
      : updateTaskAction.bind(null, task!.id, campaignId);
  const [state, formAction, pending] = useActionState<ActionState, FormData>(boundAction, undefined);

  const dueDateValue = task?.dueDate ? task.dueDate.toISOString().slice(0, 10) : "";

  return (
    <Dialog
      open={open}
      onOpenChange={setOpen}
      trigger={
        mode === "create" ? (
          <button className="inline-flex h-10 items-center gap-1.5 rounded-[11px] border border-line bg-white px-3.5 text-xs font-extrabold text-[#536174] hover:bg-[#f7fafc]">
            <Plus size={14} /> {lockOwnerTo ? "เพิ่มงานของฉัน" : "เพิ่มงาน"}
          </button>
        ) : (
          <button className="grid h-8 w-8 place-items-center rounded-lg border border-line text-[#6f7b8d] hover:bg-[#f7fafc]" aria-label="แก้ไขงาน">
            <Pencil size={13} />
          </button>
        )
      }
      eyebrow={mode === "create" ? "งานใหม่" : "แก้ไขงาน"}
      title={mode === "create" ? "คุณรับผิดชอบอะไร?" : task!.name}
    >
      <form action={formAction} className="grid gap-3.5 p-5">
        <label className="grid gap-1.5">
          <span className="text-[10px] font-extrabold text-[#59677a]">ชื่องาน</span>
          <input
            name="name"
            required
            defaultValue={task?.name}
            placeholder="เช่น เตรียมแคปชั่นสำหรับโฆษณา"
            className="h-[41px] rounded-[10px] border border-line px-3 text-[11px] outline-none focus:border-primary focus:ring-4 focus:ring-primary-soft"
          />
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="grid gap-1.5">
            <span className="text-[10px] font-extrabold text-[#59677a]">ทีม</span>
            <select name="teamId" defaultValue={task?.teamId ?? ""} className="h-[41px] rounded-[10px] border border-line px-3 text-[11px]">
              <option value="">ไม่มีทีม</option>
              {teams.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-1.5">
            <span className="text-[10px] font-extrabold text-[#59677a]">เจ้าของ</span>
            {lockOwnerTo ? (
              <>
                <input type="hidden" name="ownerId" value={lockOwnerTo.id} />
                <input disabled value={lockOwnerTo.name} className="h-[41px] rounded-[10px] border border-line bg-[#f7fafc] px-3 text-[11px] text-muted" />
              </>
            ) : (
              <select name="ownerId" defaultValue={task?.ownerId ?? ""} className="h-[41px] rounded-[10px] border border-line px-3 text-[11px]">
                <option value="">ยังไม่มอบหมาย</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
            )}
          </label>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <label className="grid gap-1.5">
            <span className="text-[10px] font-extrabold text-[#59677a]">กำหนดส่ง</span>
            <input
              name="dueDate"
              type="date"
              defaultValue={dueDateValue}
              className="h-[41px] rounded-[10px] border border-line px-3 text-[11px]"
            />
          </label>
          <label className="grid gap-1.5">
            <span className="text-[10px] font-extrabold text-[#59677a]">ใครเป็นผู้อนุมัติ?</span>
            <select name="approverId" defaultValue={task?.approverId ?? ""} className="h-[41px] rounded-[10px] border border-line px-3 text-[11px]">
              <option value="">ไม่ต้องอนุมัติ</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="grid gap-1.5">
          <span className="text-[10px] font-extrabold text-[#59677a]">ความสำคัญ</span>
          <select name="priority" defaultValue={task?.priority ?? ""} className="h-[41px] rounded-[10px] border border-line px-3 text-[11px]">
            <option value="">ไม่ระบุ</option>
            <option value="LOW">ต่ำ</option>
            <option value="MEDIUM">ปานกลาง</option>
            <option value="HIGH">สูง</option>
            <option value="URGENT">ด่วน</option>
          </select>
        </label>

        {mode === "create" && (
          <label className="grid gap-1.5">
            <span className="text-[10px] font-extrabold text-[#59677a]">ต้องทำอะไรให้เสร็จก่อนเริ่มงานนี้?</span>
            <select name="dependsOn" defaultValue="" className="h-[41px] rounded-[10px] border border-line px-3 text-[11px]">
              <option value="">ไม่มี — เริ่มงานนี้ได้ทันที</option>
              {dependencyOptions.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </label>
        )}

        <div className="rounded-[10px] border border-[#d8ebf9] bg-[#f5fbff] px-[11px] py-2.5 text-[9px] text-[#52728a]">
          FLOW จะแจ้งเตือนผู้รับงานถัดไปโดยอัตโนมัติเมื่องานที่ต้องพึ่งพาเสร็จสิ้น
        </div>

        {state?.error && <p className="rounded-lg bg-red-soft px-3 py-2 text-xs font-semibold text-red">{state.error}</p>}

        <div className="mt-1 flex justify-end gap-2">
          <button
            type="submit"
            disabled={pending}
            className="h-10 rounded-[11px] bg-primary px-4 text-xs font-extrabold text-[#173f5c] hover:bg-primary-strong disabled:opacity-60"
          >
            {pending ? "กำลังบันทึก…" : mode === "create" ? "เพิ่มงานนี้" : "บันทึกการเปลี่ยนแปลง"}
          </button>
        </div>
      </form>
    </Dialog>
  );
}
