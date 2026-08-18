import type { TaskPriority } from "@prisma/client";
import { clsx } from "clsx";

const LABELS: Record<TaskPriority, string> = {
  LOW: "ต่ำ",
  MEDIUM: "ปานกลาง",
  HIGH: "สูง",
  URGENT: "ด่วน",
};

const STYLES: Record<TaskPriority, string> = {
  LOW: "bg-[#edf1f5] text-[#6f7b8d]",
  MEDIUM: "bg-primary-soft text-[#2a81bc]",
  HIGH: "bg-orange-soft text-[#9b6517]",
  URGENT: "bg-red-soft text-red",
};

export function PriorityBadge({ priority, className }: { priority: TaskPriority | null; className?: string }) {
  if (!priority) return null;
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-lg px-2 py-1 text-[9px] font-extrabold uppercase tracking-wide",
        STYLES[priority],
        className
      )}
    >
      {LABELS[priority]}
    </span>
  );
}
