"use client";

import { useActionState, useState } from "react";
import { Plus } from "lucide-react";
import { Dialog } from "@/components/dialog";
import { createTeamAction, type ActionState } from "@/app/actions/user";

export function NewTeamDialog() {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState<ActionState, FormData>(createTeamAction, undefined);

  return (
    <Dialog
      open={open}
      onOpenChange={setOpen}
      trigger={
        <button className="inline-flex h-10 items-center gap-1.5 rounded-[11px] border border-line bg-white px-4 text-xs font-extrabold text-[#536174] hover:bg-[#f7fafc]">
          <Plus size={14} /> ทีมใหม่
        </button>
      }
      eyebrow="ใหม่"
      title="สร้างทีม"
    >
      <form action={formAction} className="grid gap-3.5 p-5">
        <label className="grid gap-1.5">
          <span className="text-[10px] font-extrabold text-[#59677a]">ชื่อทีม</span>
          <input name="name" required placeholder="เช่น Performance" className="h-[41px] rounded-[10px] border border-line px-3 text-[11px]" />
        </label>
        {state?.error && <p className="rounded-lg bg-red-soft px-3 py-2 text-xs font-semibold text-red">{state.error}</p>}
        <div className="mt-1 flex justify-end">
          <button type="submit" disabled={pending} className="h-10 rounded-[11px] bg-primary px-4 text-xs font-extrabold text-[#173f5c] disabled:opacity-60">
            {pending ? "กำลังสร้าง…" : "สร้างทีม"}
          </button>
        </div>
      </form>
    </Dialog>
  );
}
