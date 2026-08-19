"use client";

import { useActionState, useState } from "react";
import { UserPlus } from "lucide-react";
import { Dialog } from "@/components/dialog";
import { createUserAction, type ActionState } from "@/app/actions/user";

type Team = { id: string; name: string };

export function NewUserDialog({ teams }: { teams: Team[] }) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState<ActionState, FormData>(createUserAction, undefined);

  return (
    <Dialog
      open={open}
      onOpenChange={setOpen}
      trigger={
        <button className="inline-flex h-10 items-center gap-1.5 rounded-[11px] bg-primary px-4 text-xs font-extrabold text-[#173f5c] hover:bg-primary-strong">
          <UserPlus size={14} /> เพิ่มผู้ใช้
        </button>
      }
      eyebrow="ใหม่"
      title="เพิ่มผู้ใช้งาน"
    >
      <form action={formAction} className="grid gap-3.5 p-5">
        <div className="grid grid-cols-2 gap-3">
          <label className="grid gap-1.5">
            <span className="text-[10px] font-extrabold text-[#59677a]">ชื่อ</span>
            <input name="name" required className="h-[41px] rounded-[10px] border border-line px-3 text-[11px]" />
          </label>
          <label className="grid gap-1.5">
            <span className="text-[10px] font-extrabold text-[#59677a]">ตำแหน่ง</span>
            <input name="title" placeholder="เช่น กราฟิกดีไซน์" className="h-[41px] rounded-[10px] border border-line px-3 text-[11px]" />
          </label>
        </div>
        <label className="grid gap-1.5">
          <span className="text-[10px] font-extrabold text-[#59677a]">อีเมล</span>
          <input name="email" type="email" required className="h-[41px] rounded-[10px] border border-line px-3 text-[11px]" />
        </label>
        <label className="grid gap-1.5">
          <span className="text-[10px] font-extrabold text-[#59677a]">รหัสผ่านเริ่มต้น</span>
          <input
            name="password"
            type="text"
            required
            minLength={8}
            placeholder="อย่างน้อย 8 ตัวอักษร"
            className="h-[41px] rounded-[10px] border border-line px-3 text-[11px]"
          />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="grid gap-1.5">
            <span className="text-[10px] font-extrabold text-[#59677a]">บทบาท</span>
            <select name="role" defaultValue="MEMBER" className="h-[41px] rounded-[10px] border border-line px-3 text-[11px]">
              <option value="MEMBER">สมาชิก</option>
              <option value="MANAGER">ผู้จัดการ</option>
              <option value="ADMIN">ผู้ดูแลระบบ</option>
            </select>
          </label>
          <label className="grid gap-1.5">
            <span className="text-[10px] font-extrabold text-[#59677a]">ทีม</span>
            <select name="teamId" defaultValue="" className="h-[41px] rounded-[10px] border border-line px-3 text-[11px]">
              <option value="">ไม่มีทีม</option>
              {teams.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </label>
        </div>
        <label className="flex items-center gap-2 text-[11px]">
          <input type="checkbox" name="isApprover" className="h-4 w-4 accent-[#2a81bc]" />
          อนุมัติงานได้
        </label>

        {state?.error && <p className="rounded-lg bg-red-soft px-3 py-2 text-xs font-semibold text-red">{state.error}</p>}

        <div className="mt-1 flex justify-end gap-2">
          <button
            type="submit"
            disabled={pending}
            className="h-10 rounded-[11px] bg-primary px-4 text-xs font-extrabold text-[#173f5c] hover:bg-primary-strong disabled:opacity-60"
          >
            {pending ? "กำลังเพิ่ม…" : "เพิ่มผู้ใช้"}
          </button>
        </div>
      </form>
    </Dialog>
  );
}
