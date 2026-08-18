import { getCampaignActivity } from "@/server/services/activity.service";
import { formatDateTime } from "@/lib/format";

const EVENT_COPY: Record<string, (actor: string, taskName?: string, meta?: Record<string, unknown>) => string> = {
  CAMPAIGN_CREATED: (actor) => `${actor} created this campaign`,
  CAMPAIGN_STARTED: (actor) => `${actor} started the campaign`,
  TASK_CREATED: (actor, taskName) => `${actor} added "${taskName}"`,
  TASK_UPDATED: (actor, taskName) => `${actor} updated "${taskName}"`,
  TASK_ASSIGNED: (actor, taskName) => `${actor} reassigned "${taskName}"`,
  TASK_STARTED: (actor, taskName) => `${actor} started "${taskName}"`,
  TASK_SUBMITTED: (actor, taskName) => `${actor} submitted "${taskName}" for review`,
  TASK_APPROVED: (actor, taskName) => `${actor} approved "${taskName}"`,
  TASK_REVISION_REQUESTED: (actor, taskName) => `${actor} requested revision on "${taskName}"`,
  TASK_COMPLETED: (actor, taskName) => `System completed "${taskName}"`,
  TASK_READY: (actor, taskName) => `System unlocked "${taskName}"`,
  TASK_HANDOFF: (actor, taskName) => `Work handed off to "${taskName}"`,
  TASK_OVERDUE: (actor, taskName) => `"${taskName}" is overdue`,
  CAMPAIGN_COMPLETED: () => `Campaign completed — all tasks are done`,
};

export default async function CampaignActivityPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const activity = await getCampaignActivity(id);

  if (activity.length === 0) {
    return <div className="rounded-2xl border border-dashed border-line bg-white p-10 text-center text-sm text-muted">No activity yet.</div>;
  }

  return (
    <div className="rounded-[17px] border border-line bg-white">
      {activity.map((a) => {
        const describe = EVENT_COPY[a.eventType] ?? (() => a.eventType);
        return (
          <div key={a.id} className="grid grid-cols-[70px_1fr] gap-3 border-b border-[#eef2f5] px-5 py-3.5 last:border-b-0">
            <time className="text-[9px] text-[#a5afbc]">{formatDateTime(a.createdAt)}</time>
            <p className="text-[12px]">{describe(a.actor?.name ?? "System", a.task?.name)}</p>
          </div>
        );
      })}
    </div>
  );
}
