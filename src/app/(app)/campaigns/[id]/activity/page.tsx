import { getCampaignActivity } from "@/server/services/activity.service";
import { formatDateTime } from "@/lib/format";

const EVENT_COPY: Record<string, (actor: string, taskName?: string, meta?: Record<string, unknown>) => string> = {
  CAMPAIGN_CREATED: (actor) => `${actor} สร้างแคมเปญนี้`,
  CAMPAIGN_STARTED: (actor) => `${actor} เริ่มแคมเปญ`,
  TASK_CREATED: (actor, taskName) => `${actor} เพิ่มงาน "${taskName}"`,
  TASK_UPDATED: (actor, taskName) => `${actor} แก้ไขงาน "${taskName}"`,
  TASK_ASSIGNED: (actor, taskName) => `${actor} มอบหมายงาน "${taskName}" ใหม่`,
  TASK_STARTED: (actor, taskName) => `${actor} เริ่มงาน "${taskName}"`,
  TASK_SUBMITTED: (actor, taskName) => `${actor} ส่งงาน "${taskName}" เพื่อตรวจสอบ`,
  TASK_APPROVED: (actor, taskName) => `${actor} อนุมัติงาน "${taskName}"`,
  TASK_REVISION_REQUESTED: (actor, taskName) => `${actor} ขอให้แก้ไขงาน "${taskName}"`,
  TASK_COMPLETED: (actor, taskName) => `ระบบทำงาน "${taskName}" เสร็จสิ้น`,
  TASK_READY: (actor, taskName) => `ระบบปลดล็อกงาน "${taskName}"`,
  TASK_HANDOFF: (actor, taskName) => `ส่งต่องานให้ "${taskName}"`,
  TASK_OVERDUE: (actor, taskName) => `"${taskName}" เกินกำหนดแล้ว`,
  CAMPAIGN_COMPLETED: () => `แคมเปญเสร็จสิ้น — งานทั้งหมดเรียบร้อยแล้ว`,
};

export default async function CampaignActivityPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const activity = await getCampaignActivity(id);

  if (activity.length === 0) {
    return <div className="rounded-2xl border border-dashed border-line bg-white p-10 text-center text-sm text-muted">ยังไม่มีกิจกรรม</div>;
  }

  return (
    <div className="rounded-[17px] border border-line bg-white">
      {activity.map((a) => {
        const describe = EVENT_COPY[a.eventType] ?? (() => a.eventType);
        return (
          <div key={a.id} className="grid grid-cols-[70px_1fr] gap-3 border-b border-[#eef2f5] px-5 py-3.5 last:border-b-0">
            <time className="text-[9px] text-[#a5afbc]">{formatDateTime(a.createdAt)}</time>
            <p className="text-[12px]">{describe(a.actor?.name ?? "ระบบ", a.task?.name)}</p>
          </div>
        );
      })}
    </div>
  );
}
