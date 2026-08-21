"use client";

import { useActionState, useState } from "react";
import { Plus } from "lucide-react";
import { Dialog } from "@/components/dialog";
import { quickAddTaskAction, type ActionState } from "@/app/actions/task";

type Option = { id: string; name: string };

export function QuickAddTaskDialog({
  campaigns,
  users,
  currentUser,
}: {
  campaigns: Option[];
  users: Option[];
  currentUser: { id: string; name: string };
}) {
  const [open, setOpen] = useState(false);
  const [advanced, setAdvanced] = useState(false);
  const [state, formAction, pending] = useActionState<ActionState, FormData>(quickAddTaskAction, undefined);

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) setAdvanced(false);
      }}
      trigger={
        <button className="inline-flex h-10 items-center gap-1.5 rounded-[11px] bg-primary px-4 text-xs font-extrabold text-[#173f5c] hover:bg-primary-strong">
          <Plus size={14} /> งาน
        </button>
      }
      eyebrow="งานใหม่"
      title="เพิ่มงาน"
    >
      <form action={formAction} className="grid gap-3.5 p-5">
        <label className="grid gap-1.5">
          <span className="text-[10px] font-extrabold text-[#59677a]">งานอะไร?</span>
          <input
            name="title"
            required
            autoFocus
            placeholder="เช่น โทรหา supplier เรื่อง package"
            className="h-[41px] rounded-[10px] border border-line px-3 text-[11px] outline-none focus:border-primary focus:ring-4 focus:ring-primary-soft"
          />
        </label>

        <label className="grid gap-1.5">
          <span className="text-[10px] font-extrabold text-[#59677a]">คนรับผิดชอบ</span>
          <select name="ownerId" defaultValue={currentUser.id} className="h-[41px] rounded-[10px] border border-line px-3 text-[11px]">
            <option value={currentUser.id}>ฉัน ({currentUser.name})</option>
            {users
              .filter((u) => u.id !== currentUser.id)
              .map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
          </select>
        </label>

        {!advanced ? (
          <button type="button" onClick={() => setAdvanced(true)} className="text-left text-[10px] font-bold text-primary-strong underline">
            เพิ่มรายละเอียดของงาน
          </button>
        ) : (
          <>
            <label className="grid gap-1.5">
              <span className="text-[10px] font-extrabold text-[#59677a]">แคมเปญ (ไม่บังคับ)</span>
              <select name="campaignId" defaultValue="" className="h-[41px] rounded-[10px] border border-line px-3 text-[11px]">
                <option value="">ไม่ผูกกับแคมเปญ</option>
                {campaigns.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="grid gap-1.5">
                <span className="text-[10px] font-extrabold text-[#59677a]">ความสำคัญ</span>
                <select name="priority" defaultValue="" className="h-[41px] rounded-[10px] border border-line px-3 text-[11px]">
                  <option value="">ไม่ระบุ</option>
                  <option value="LOW">ต่ำ</option>
                  <option value="MEDIUM">ปานกลาง</option>
                  <option value="HIGH">สูง</option>
                  <option value="URGENT">ด่วน</option>
                </select>
              </label>
              <label className="grid gap-1.5">
                <span className="text-[10px] font-extrabold text-[#59677a]">กำหนดส่ง</span>
                <input name="dueDate" type="date" className="h-[41px] rounded-[10px] border border-line px-3 text-[11px]" />
              </label>
            </div>
            <label className="grid gap-1.5">
              <span className="text-[10px] font-extrabold text-[#59677a]">รายละเอียด</span>
              <textarea
                name="description"
                rows={3}
                placeholder="ไม่บังคับ"
                className="rounded-[10px] border border-line p-3 text-[11px] outline-none focus:border-primary"
              />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="grid gap-1.5">
                <span className="text-[10px] font-extrabold text-[#59677a]">ชื่อไฟล์แนบ (ไม่บังคับ)</span>
                <input name="attachmentName" placeholder="เช่น ไฟล์งานออกแบบ" className="h-[41px] rounded-[10px] border border-line px-3 text-[11px]" />
              </label>
              <label className="grid gap-1.5">
                <span className="text-[10px] font-extrabold text-[#59677a]">ลิงก์แนบไฟล์ (ไม่บังคับ)</span>
                <input name="attachmentUrl" placeholder="วางลิงก์ Google Drive ที่นี่…" className="h-[41px] rounded-[10px] border border-line px-3 text-[11px]" />
              </label>
            </div>
          </>
        )}

        {state?.error && <p className="rounded-lg bg-red-soft px-3 py-2 text-xs font-semibold text-red">{state.error}</p>}

        <div className="mt-1 flex justify-end gap-2">
          <button
            type="submit"
            disabled={pending}
            className="h-10 rounded-[11px] bg-primary px-4 text-xs font-extrabold text-[#173f5c] hover:bg-primary-strong disabled:opacity-60"
          >
            {pending ? "กำลังเพิ่ม…" : "เพิ่มงาน"}
          </button>
        </div>
      </form>
    </Dialog>
  );
}
