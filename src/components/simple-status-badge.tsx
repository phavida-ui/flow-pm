import { clsx } from "clsx";
import { SIMPLE_STATUS_LABELS, type SimpleStatus } from "@/lib/task-status";

const STYLES: Record<SimpleStatus, string> = {
  DOING: "bg-purple-soft text-purple",
  READY: "bg-primary-soft text-[#2a81bc]",
  WAITING: "bg-[#edf1f5] text-[#6f7b8d]",
  DONE: "bg-green-soft text-green",
};

export function SimpleStatusBadge({ status, className }: { status: SimpleStatus; className?: string }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-lg px-2 py-1 text-[9px] font-extrabold uppercase tracking-wide",
        STYLES[status],
        className
      )}
    >
      {SIMPLE_STATUS_LABELS[status]}
    </span>
  );
}
