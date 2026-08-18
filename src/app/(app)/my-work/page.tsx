import { requireUser } from "@/server/auth";
import { getMyWork } from "@/server/services/task.service";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { Panel } from "@/components/panel";
import { TaskCard } from "@/components/task-card";

export default async function MyWorkPage() {
  const user = await requireUser();
  const work = await getMyWork(user.id);

  const eyebrow = new Intl.DateTimeFormat("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(
    new Date()
  );

  return (
    <div>
      <PageHeader eyebrow={eyebrow} title="My Work" />

      <div className="mb-5 grid grid-cols-5 gap-2.5 max-[800px]:grid-cols-2">
        <StatCard label="Ready" value={work.ready.length} />
        <StatCard label="In Progress" value={work.inProgress.length} />
        <StatCard label="Waiting for Approval" value={work.waitingApproval.length} />
        <StatCard label="Waiting for Others" value={work.blocked.length} />
        <StatCard label="Overdue" value={work.overdue.length} tone="danger" />
      </div>

      <div className="grid grid-cols-[1.35fr_.65fr] gap-4 max-[800px]:grid-cols-1">
        <div className="grid gap-4">
          <Panel title="Need Action" subtitle="Ready, in progress, or sent back for revision" empty={work.ready.length + work.inProgress.length + work.revision.length === 0}>
            {work.ready.length + work.inProgress.length + work.revision.length === 0 ? (
              "Nothing needs your attention right now."
            ) : (
              <>
                {[...work.inProgress, ...work.revision, ...work.ready].map((t) => (
                  <TaskCard key={t.id} task={t} />
                ))}
              </>
            )}
          </Panel>

          <Panel title="Waiting for Others" subtitle="Blocked tasks assigned to you" empty={work.blocked.length === 0}>
            {work.blocked.length === 0
              ? "Nothing is blocked on someone else right now."
              : work.blocked.map((t) => <TaskCard key={t.id} task={t} />)}
          </Panel>

          <Panel title="Completed Today" empty={work.completedToday.length === 0}>
            {work.completedToday.length === 0
              ? "Nothing completed yet today."
              : work.completedToday.map((t) => <TaskCard key={t.id} task={t} />)}
          </Panel>
        </div>

        <div className="grid gap-4">
          <Panel title="Waiting for Your Approval" subtitle="Review requests" empty={work.waitingApproval.length === 0}>
            {work.waitingApproval.length === 0
              ? "No pending approvals."
              : work.waitingApproval.map((t) => <TaskCard key={t.id} task={t} />)}
          </Panel>
        </div>
      </div>
    </div>
  );
}
