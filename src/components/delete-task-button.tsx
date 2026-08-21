"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { deleteTaskAction } from "@/app/actions/task";

export function DeleteTaskButton({
  taskId,
  campaignId,
  taskName,
  redirectTo,
}: {
  taskId: string;
  campaignId: string | null;
  taskName: string;
  redirectTo: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleDelete() {
    if (!window.confirm(`ลบงาน "${taskName}" ใช่หรือไม่? การกระทำนี้ย้อนกลับไม่ได้`)) return;
    setError(null);
    startTransition(async () => {
      try {
        await deleteTaskAction(taskId, campaignId);
        router.push(redirectTo);
      } catch (err) {
        setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
      }
    });
  }

  return (
    <div className="grid justify-items-end gap-1">
      <button
        disabled={pending}
        onClick={handleDelete}
        aria-label="ลบงาน"
        className="grid h-10 w-10 place-items-center rounded-[11px] border border-line text-[#b14a4a] hover:bg-red-soft disabled:opacity-40"
      >
        <Trash2 size={15} />
      </button>
      {error && <p className="max-w-[220px] text-right text-[10px] font-semibold text-red">{error}</p>}
    </div>
  );
}
