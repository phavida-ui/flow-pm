"use client";

import { useActionState, useState, useTransition } from "react";
import { AlertTriangle } from "lucide-react";
import { markBlockedAction, clearBlockedAction, type ActionState } from "@/app/actions/blocked";
import { BLOCKED_REASON_LABELS, BLOCKED_REASON_OPTIONS } from "@/lib/blocked-reason";
import type { TaskBlockedReason } from "@prisma/client";

export function MarkBlockedControl({
  taskId,
  campaignId,
  blockedAt,
  blockedReason,
  blockedNote,
}: {
  taskId: string;
  campaignId: string | null;
  blockedAt: Date | null;
  blockedReason: TaskBlockedReason | null;
  blockedNote: string | null;
}) {
  const [open, setOpen] = useState(false);
  const boundAction = markBlockedAction.bind(null, taskId, campaignId);
  const [state, formAction, pending] = useActionState<ActionState, FormData>(boundAction, undefined);
  const [, startTransition] = useTransition();

  if (blockedAt && blockedReason) {
    return (
      <div className="grid gap-1.5 rounded-[11px] border border-[#f0d5b3] bg-orange-soft px-3 py-2.5 text-[11px]">
        <div className="flex items-center justify-between gap-2">
          <span className="font-bold text-[#9b6517]">ติดปัญหา: {BLOCKED_REASON_LABELS[blockedReason]}</span>
          <button
            type="button"
            className="text-[10px] font-bold text-[#9b6517] underline"
            onClick={() => startTransition(() => clearBlockedAction(taskId, campaignId))}
          >
            หายแล้ว
          </button>
        </div>
        {blockedNote && <p className="text-[10px] text-[#9b6517]">{blockedNote}</p>}
      </div>
    );
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-11 items-center gap-1.5 rounded-[11px] border border-line px-4 text-[13px] font-bold text-[#8a6d3b] hover:bg-[#fdf6ea]"
      >
        <AlertTriangle size={14} /> ติดปัญหา
      </button>
    );
  }

  return (
    <form action={formAction} className="grid gap-2 rounded-[11px] border border-line p-3">
      <div className="grid gap-1.5">
        {BLOCKED_REASON_OPTIONS.map((reason) => (
          <label key={reason} className="flex items-center gap-2 text-[12px]">
            <input type="radio" name="reason" value={reason} required className="h-3.5 w-3.5" />
            {BLOCKED_REASON_LABELS[reason]}
          </label>
        ))}
      </div>
      <textarea
        name="note"
        placeholder="รายละเอียดเพิ่มเติม (ไม่บังคับ)"
        rows={2}
        className="rounded-[10px] border border-line p-2 text-[11px] outline-none focus:border-primary"
      />
      {state?.error && <p className="text-[11px] font-semibold text-red">{state.error}</p>}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={pending}
          className="h-9 rounded-[10px] bg-primary px-3 text-[11px] font-extrabold text-[#173f5c] disabled:opacity-60"
        >
          บันทึก
        </button>
        <button type="button" onClick={() => setOpen(false)} className="h-9 rounded-[10px] border border-line px-3 text-[11px] font-bold text-muted">
          ยกเลิก
        </button>
      </div>
    </form>
  );
}
