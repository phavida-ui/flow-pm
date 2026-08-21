import Link from "next/link";
import { requireRole } from "@/server/auth";
import { getTeamWorkload } from "@/server/services/team.service";
import { PageHeader } from "@/components/page-header";
import { Avatar } from "@/components/avatar";
import { StatusBadge } from "@/components/status-badge";
import { PriorityBadge } from "@/components/priority-badge";
import { BlockedFlagBadge } from "@/components/blocked-flag-badge";
import { formatDue } from "@/lib/format";

export default async function TeamPage() {
  await requireRole("ADMIN", "MANAGER");
  const workload = await getTeamWorkload();

  return (
    <div>
      <PageHeader eyebrow="ทีม" title="ภาพรวมทีม" />

      <div className="grid grid-cols-2 gap-4 max-[900px]:grid-cols-1">
        {workload.map(({ user, tasks, overdueCount }) => (
          <section key={user.id} className="overflow-hidden rounded-[17px] border border-line bg-white">
            <div className="flex items-center justify-between gap-3 border-b border-line px-[18px] py-[15px]">
              <div className="flex items-center gap-2.5">
                <Avatar name={user.name} size={32} />
                <div>
                  <div className="text-[13px] font-extrabold">{user.name}</div>
                  <div className="text-[10px] text-muted">{user.title ?? user.team?.name ?? "—"}</div>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="rounded-full bg-primary-soft px-2 py-1 text-[9px] font-extrabold text-[#2a81bc]">
                  {tasks.length} งาน
                </span>
                {overdueCount > 0 && (
                  <span className="rounded-full bg-red-soft px-2 py-1 text-[9px] font-extrabold text-red">
                    เกินกำหนด {overdueCount}
                  </span>
                )}
              </div>
            </div>

            <div className="px-3 py-2">
              {tasks.length === 0 ? (
                <p className="p-5 text-center text-[11px] text-muted">ไม่มีงานที่กำลังดำเนินการ</p>
              ) : (
                tasks.map((t) => (
                  <Link
                    key={t.id}
                    href={`/tasks/${t.id}`}
                    className="grid grid-cols-[1fr_auto] items-center gap-3 rounded-[10px] border-b border-[#f0f3f6] px-2.5 py-3 last:border-b-0 hover:bg-[#f9fbfd]"
                  >
                    <div className="min-w-0">
                      <div className="truncate text-[12px] font-bold">{t.name}</div>
                      <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-[10px] text-muted">
                        <span>{t.campaign?.name ?? "งานเดี่ยว"}</span>
                        {t.dueDate && <span>· กำหนดส่ง {formatDue(t.dueDate)}</span>}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <StatusBadge status={t.status} />
                      <div className="flex gap-1">
                        {t.priority && <PriorityBadge priority={t.priority} />}
                        <BlockedFlagBadge blockedAt={t.blockedAt} blockedReason={t.blockedReason} />
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
