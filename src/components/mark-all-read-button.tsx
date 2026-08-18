"use client";

import { useTransition } from "react";
import { markAllReadAction } from "@/app/actions/notification";

export function MarkAllReadButton() {
  const [pending, startTransition] = useTransition();
  return (
    <button
      disabled={pending}
      onClick={() => startTransition(() => markAllReadAction())}
      className="h-10 rounded-[11px] border border-line bg-white px-4 text-xs font-extrabold text-[#536174] hover:bg-[#f7fafc] disabled:opacity-60"
    >
      Mark all read
    </button>
  );
}
