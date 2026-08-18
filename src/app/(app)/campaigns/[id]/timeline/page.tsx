import { prisma } from "@/server/db";
import { StatusBadge } from "@/components/status-badge";
import { formatDue } from "@/lib/format";

export default async function CampaignTimelinePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const tasks = await prisma.task.findMany({
    where: { campaignId: id, status: { not: "CANCELLED" } },
    include: {
      owner: { select: { name: true } },
      dependsOn: { select: { dependsOnTaskId: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  // Longest-path depth from any dependency-free task — groups parallel branches on the same row.
  const depthById = new Map<string, number>();
  const byId = new Map(tasks.map((t) => [t.id, t]));

  function depthOf(id: string, seen = new Set<string>()): number {
    if (depthById.has(id)) return depthById.get(id)!;
    if (seen.has(id)) return 0;
    seen.add(id);
    const task = byId.get(id);
    if (!task || task.dependsOn.length === 0) {
      depthById.set(id, 0);
      return 0;
    }
    const d = 1 + Math.max(...task.dependsOn.map((dep) => depthOf(dep.dependsOnTaskId, seen)));
    depthById.set(id, d);
    return d;
  }
  tasks.forEach((t) => depthOf(t.id));

  const levels = new Map<number, typeof tasks>();
  for (const t of tasks) {
    const d = depthById.get(t.id)!;
    levels.set(d, [...(levels.get(d) ?? []), t]);
  }
  const orderedLevels = [...levels.entries()].sort((a, b) => a[0] - b[0]);

  if (tasks.length === 0) {
    return <div className="rounded-2xl border border-dashed border-line bg-white p-10 text-center text-sm text-muted">No tasks yet.</div>;
  }

  return (
    <div className="rounded-[17px] border border-line bg-white p-5">
      <div className="grid gap-0">
        {orderedLevels.map(([depth, levelTasks], i) => (
          <div key={depth} className="relative pb-6 last:pb-0">
            {i < orderedLevels.length - 1 && (
              <div className="absolute bottom-0 left-[19px] top-[38px] w-0.5 bg-[#e8edf2]" />
            )}
            <div className="grid grid-cols-[38px_1fr] gap-3">
              <div
                className={
                  "z-10 grid h-[38px] w-[38px] place-items-center rounded-full text-[11px] font-black " +
                  (levelTasks.every((t) => t.status === "COMPLETED")
                    ? "bg-green-soft text-green"
                    : levelTasks.some((t) => t.status === "IN_PROGRESS" || t.status === "REVIEW")
                    ? "border-2 border-[#aed8f5] bg-primary-soft text-[#2d82bd]"
                    : "bg-[#f0f2f5] text-[#728093]")
                }
              >
                {depth + 1}
              </div>
              <div className="grid gap-2.5">
                {levelTasks.map((t) => (
                  <div key={t.id} className="grid grid-cols-[1fr_auto] items-center gap-3 rounded-[13px] border border-line p-3.5 hover:bg-[#fbfcfe]">
                    <div>
                      <strong className="text-[12px]">{t.name}</strong>
                      <div className="mt-1 flex gap-2 text-[9px] text-muted">
                        <span>{t.owner?.name ?? "Unassigned"}</span>
                        {t.dueDate && <span>Due {formatDue(t.dueDate)}</span>}
                      </div>
                    </div>
                    <StatusBadge status={t.status} />
                  </div>
                ))}
                {levelTasks.length > 1 && (
                  <p className="rounded-[10px] border border-dashed border-[#dfe5eb] bg-[#fafbfc] px-2.5 py-2 text-[9px] text-[#758195]">
                    These run in parallel.
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
