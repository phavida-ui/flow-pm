import type { CampaignStatus } from "@prisma/client";
import { clsx } from "clsx";

const LABELS: Record<CampaignStatus, string> = {
  DRAFT: "ฉบับร่าง",
  PLANNING: "กำลังวางแผน",
  READY_TO_START: "พร้อมเริ่ม",
  ACTIVE: "ดำเนินอยู่",
  COMPLETED: "เสร็จสิ้น",
  CANCELLED: "ยกเลิก",
};

const STYLES: Record<CampaignStatus, string> = {
  DRAFT: "bg-[#edf1f5] text-[#6f7b8d]",
  PLANNING: "bg-primary-soft text-[#2a81bc]",
  READY_TO_START: "bg-purple-soft text-purple",
  ACTIVE: "bg-green-soft text-green",
  COMPLETED: "bg-[#edf1f5] text-[#4b5563]",
  CANCELLED: "bg-red-soft text-red",
};

export function CampaignStatusBadge({ status }: { status: CampaignStatus }) {
  return (
    <span className={clsx("inline-flex items-center rounded-lg px-2 py-1 text-[9px] font-extrabold uppercase tracking-wide", STYLES[status])}>
      {LABELS[status]}
    </span>
  );
}
