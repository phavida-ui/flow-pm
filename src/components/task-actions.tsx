"use client";

import { useState, useTransition } from "react";
import { startTaskAction } from "@/app/actions/task";
import { submitTaskAction, approveTaskAction, requestRevisionAction, resumeAfterRevisionAction } from "@/app/actions/approval";
import type { TaskStatus } from "@prisma/client";

export function TaskActions({
  taskId,
  campaignId,
  status,
  isOwner,
  isApprover,
  hasApprover,
}: {
  taskId: string;
  campaignId: string;
  status: TaskStatus;
  isOwner: boolean;
  isApprover: boolean;
  hasApprover: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [comment, setComment] = useState("");
  const [showRevisionInput, setShowRevisionInput] = useState(false);

  function run(fn: () => Promise<{ error?: string } | undefined>) {
    setError(null);
    startTransition(async () => {
      const res = await fn();
      if (res?.error) setError(res.error);
    });
  }

  const btnClass =
    "h-11 rounded-[11px] bg-primary px-5 text-[13px] font-extrabold text-[#173f5c] hover:bg-primary-strong disabled:opacity-60";
  const btnDangerClass =
    "h-11 rounded-[11px] bg-red-soft border border-[#f0d5d5] px-5 text-[13px] font-extrabold text-[#b14a4a] hover:opacity-80 disabled:opacity-60";

  return (
    <div className="grid gap-3">
      <div className="flex flex-wrap gap-2.5">
        {status === "READY" && isOwner && (
          <button disabled={pending} className={btnClass} onClick={() => run(() => startTaskAction(taskId, campaignId))}>
            เริ่มงาน
          </button>
        )}

        {status === "IN_PROGRESS" && isOwner && (
          <button disabled={pending} className={btnClass} onClick={() => run(() => submitTaskAction(taskId, campaignId))}>
            {hasApprover ? "ส่งตรวจสอบ" : "งานเสร็จสิ้น"}
          </button>
        )}

        {status === "REVISION" && isOwner && (
          <button disabled={pending} className={btnClass} onClick={() => run(() => resumeAfterRevisionAction(taskId, campaignId))}>
            ดำเนินงานต่อ
          </button>
        )}

        {status === "REVIEW" && isApprover && !showRevisionInput && (
          <>
            <button disabled={pending} className={btnClass} onClick={() => run(() => approveTaskAction(taskId, campaignId, comment))}>
              อนุมัติ
            </button>
            <button disabled={pending} className={btnDangerClass} onClick={() => setShowRevisionInput(true)}>
              ขอให้แก้ไข
            </button>
          </>
        )}
      </div>

      {status === "REVIEW" && isApprover && showRevisionInput && (
        <div className="grid gap-2">
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="ต้องแก้ไขอะไรบ้าง? (จำเป็นต้องกรอก)"
            rows={3}
            className="rounded-[11px] border border-line p-3 text-[12px] outline-none focus:border-primary"
          />
          <div className="flex gap-2">
            <button
              disabled={pending || !comment.trim()}
              className={btnDangerClass}
              onClick={() => run(() => requestRevisionAction(taskId, campaignId, comment))}
            >
              ส่งกลับให้แก้ไข
            </button>
            <button className="h-11 rounded-[11px] border border-line px-4 text-[12px] font-bold text-muted" onClick={() => setShowRevisionInput(false)}>
              ยกเลิก
            </button>
          </div>
        </div>
      )}

      {error && <p className="rounded-lg bg-red-soft px-3 py-2 text-xs font-semibold text-red">{error}</p>}
    </div>
  );
}
