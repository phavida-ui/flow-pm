"use client";

import { useActionState, useState, useTransition } from "react";
import { Link2, ExternalLink, Trash2 } from "lucide-react";
import { addAttachmentAction, removeAttachmentAction, type ActionState } from "@/app/actions/attachment";

type AttachmentRow = {
  id: string;
  fileName: string;
  fileUrl: string;
  uploader: { id: string; name: string };
};

export function AttachmentList({
  taskId,
  attachments,
  currentUserId,
}: {
  taskId: string;
  attachments: AttachmentRow[];
  currentUserId: string;
}) {
  const boundAdd = addAttachmentAction.bind(null, taskId);
  const [state, formAction, pending] = useActionState<ActionState, FormData>(boundAdd, undefined);
  const [, startTransition] = useTransition();
  const [removeError, setRemoveError] = useState<string | null>(null);

  function remove(id: string) {
    setRemoveError(null);
    startTransition(async () => {
      try {
        await removeAttachmentAction(id, taskId);
      } catch (err) {
        setRemoveError(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
      }
    });
  }

  return (
    <div className="rounded-[17px] border border-line bg-white p-5">
      <h3 className="mb-3 text-sm font-extrabold">ลิงก์แนบไฟล์</h3>

      <div className="mb-3 grid gap-2">
        {attachments.length === 0 && <p className="text-[11px] text-muted">ยังไม่มีลิงก์แนบ</p>}
        {attachments.map((a) => (
          <div key={a.id} className="flex items-center gap-2.5 rounded-[10px] border border-line px-3 py-2.5">
            <Link2 size={14} className="flex-none text-muted" />
            <a
              href={a.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex min-w-0 flex-1 items-center gap-1 truncate text-[12px] font-semibold text-primary-strong hover:underline"
            >
              <span className="truncate">{a.fileName}</span>
              <ExternalLink size={11} className="flex-none" />
            </a>
            <span className="flex-none text-[9px] text-muted">{a.uploader.name}</span>
            {a.uploader.id === currentUserId && (
              <button
                onClick={() => remove(a.id)}
                aria-label="ลบลิงก์"
                className="grid h-7 w-7 flex-none place-items-center rounded-lg text-[#b14a4a] hover:bg-red-soft"
              >
                <Trash2 size={12} />
              </button>
            )}
          </div>
        ))}
      </div>

      <form action={formAction} className="grid grid-cols-[1fr_1fr_auto] gap-2 max-[560px]:grid-cols-1">
        <input
          name="fileName"
          placeholder="ชื่อไฟล์ (ไม่บังคับ)"
          className="h-9 rounded-[10px] border border-line px-3 text-[11px] outline-none focus:border-primary"
        />
        <input
          name="fileUrl"
          placeholder="วางลิงก์ Google Drive ที่นี่…"
          className="h-9 rounded-[10px] border border-line px-3 text-[11px] outline-none focus:border-primary"
        />
        <button
          disabled={pending}
          className="h-9 rounded-[10px] bg-primary px-4 text-[11px] font-extrabold text-[#173f5c] disabled:opacity-60"
        >
          {pending ? "กำลังแนบ…" : "แนบลิงก์"}
        </button>
      </form>

      {(state?.error || removeError) && (
        <p className="mt-2 text-[11px] font-semibold text-red">{state?.error ?? removeError}</p>
      )}
    </div>
  );
}
