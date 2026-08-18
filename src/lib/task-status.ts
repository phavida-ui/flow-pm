import type { TaskStatus, TaskPriority } from "@prisma/client";

export type SimpleStatus = "DOING" | "READY" | "WAITING" | "DONE";

export const SIMPLE_STATUS_ORDER: SimpleStatus[] = ["DOING", "READY", "WAITING", "DONE"];

export const SIMPLE_STATUS_LABELS: Record<SimpleStatus, string> = {
  DOING: "กำลังทำ",
  READY: "เริ่มได้แล้ว",
  WAITING: "กำลังรอ",
  DONE: "เสร็จแล้ว",
};

export function toSimpleStatus(task: { status: TaskStatus }): SimpleStatus | null {
  switch (task.status) {
    case "READY":
      return "READY";
    case "BLOCKED":
      return "WAITING";
    case "IN_PROGRESS":
    case "REVIEW":
    case "REVISION":
      return "DOING";
    case "COMPLETED":
      return "DONE";
    case "PLANNED":
    case "CANCELLED":
    default:
      return null;
  }
}

const PRIORITY_RANK: Record<TaskPriority, number> = {
  URGENT: 0,
  HIGH: 1,
  MEDIUM: 2,
  LOW: 3,
};

export function priorityRank(p: TaskPriority | null | undefined): number {
  if (!p) return 4;
  return PRIORITY_RANK[p];
}
