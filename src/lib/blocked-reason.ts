import type { TaskBlockedReason } from "@prisma/client";

export const BLOCKED_REASON_LABELS: Record<TaskBlockedReason, string> = {
  WAITING_PERSON: "รอคน",
  WAITING_ANSWER: "รอคำตอบ",
  WAITING_FILE: "รอไฟล์",
  OTHER: "มีปัญหาอื่น",
};

export const BLOCKED_REASON_OPTIONS: TaskBlockedReason[] = [
  "WAITING_PERSON",
  "WAITING_ANSWER",
  "WAITING_FILE",
  "OTHER",
];
