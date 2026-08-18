"use client";

import { useRef, useTransition } from "react";
import { addCommentAction } from "@/app/actions/task";

export function CommentForm({ taskId, campaignId }: { taskId: string; campaignId: string }) {
  const ref = useRef<HTMLFormElement>(null);
  const [pending, startTransition] = useTransition();

  return (
    <form
      ref={ref}
      action={(formData) => {
        const body = String(formData.get("body") ?? "");
        startTransition(async () => {
          await addCommentAction(taskId, campaignId, body);
          ref.current?.reset();
        });
      }}
      className="flex gap-2"
    >
      <input
        name="body"
        placeholder="เพิ่มความคิดเห็น…"
        required
        className="h-10 flex-1 rounded-[10px] border border-line px-3 text-[12px] outline-none focus:border-primary"
      />
      <button disabled={pending} className="h-10 rounded-[10px] bg-primary px-4 text-[11px] font-extrabold text-[#173f5c] disabled:opacity-60">
        โพสต์
      </button>
    </form>
  );
}
