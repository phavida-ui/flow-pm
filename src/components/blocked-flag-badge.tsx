import type { TaskBlockedReason } from "@prisma/client";
import { BLOCKED_REASON_LABELS } from "@/lib/blocked-reason";

export function BlockedFlagBadge({
  blockedAt,
  blockedReason,
}: {
  blockedAt: Date | null;
  blockedReason: TaskBlockedReason | null;
}) {
  if (!blockedAt || !blockedReason) return null;
  return (
    <span className="inline-flex items-center rounded-lg bg-orange-soft px-2 py-1 text-[9px] font-extrabold uppercase tracking-wide text-[#9b6517]">
      ติดปัญหา: {BLOCKED_REASON_LABELS[blockedReason]}
    </span>
  );
}
