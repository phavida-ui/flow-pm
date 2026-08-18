import type { TaskStatus } from "@prisma/client";
import { clsx } from "clsx";

const LABELS: Record<TaskStatus, string> = {
  PLANNED: "Planned",
  BLOCKED: "Blocked",
  READY: "Ready",
  IN_PROGRESS: "In Progress",
  REVIEW: "Review",
  REVISION: "Revision",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

const STYLES: Record<TaskStatus, string> = {
  PLANNED: "bg-[#edf1f5] text-[#6f7b8d]",
  BLOCKED: "bg-[#edf1f5] text-[#6f7b8d]",
  READY: "bg-primary-soft text-[#2a81bc]",
  IN_PROGRESS: "bg-purple-soft text-purple",
  REVIEW: "bg-orange-soft text-[#9b6517]",
  REVISION: "bg-red-soft text-red",
  COMPLETED: "bg-green-soft text-green",
  CANCELLED: "bg-[#edf1f5] text-[#6f7b8d] line-through",
};

export function StatusBadge({ status, className }: { status: TaskStatus; className?: string }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-lg px-2 py-1 text-[9px] font-extrabold uppercase tracking-wide",
        STYLES[status],
        className
      )}
    >
      {LABELS[status]}
    </span>
  );
}

export function isOverdue(dueDate: Date | null, status: TaskStatus) {
  if (!dueDate) return false;
  if (status === "COMPLETED" || status === "CANCELLED") return false;
  return dueDate.getTime() < Date.now();
}
