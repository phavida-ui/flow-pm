import { requireUser } from "@/server/auth";
import { getMyWork } from "@/server/services/task.service";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { Panel } from "@/components/panel";
import { TaskCard } from "@/components/task-card";

export default async function MyWorkPage() {
  const user = await requireUser();
  const work = await getMyWork(user.id);

  const eyebrow = new Intl.DateTimeFormat("th-TH", { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(
    new Date()
  );

  return (
    <div>
      <PageHeader eyebrow={eyebrow} title="งานของฉัน" />

      <div className="mb-5 grid grid-cols-5 gap-2.5 max-[800px]:grid-cols-2">
        <StatCard label="พร้อมดำเนินการ" value={work.ready.length} />
        <StatCard label="กำลังดำเนินการ" value={work.inProgress.length} />
        <StatCard label="รออนุมัติ" value={work.waitingApproval.length} />
        <StatCard label="รอผู้อื่น" value={work.blocked.length} />
        <StatCard label="เกินกำหนด" value={work.overdue.length} tone="danger" />
      </div>

      <div className="grid grid-cols-[1.35fr_.65fr] gap-4 max-[800px]:grid-cols-1">
        <div className="grid gap-4">
          <Panel title="ต้องดำเนินการ" subtitle="พร้อมดำเนินการ กำลังดำเนินการ หรือถูกส่งกลับให้แก้ไข" empty={work.ready.length + work.inProgress.length + work.revision.length === 0}>
            {work.ready.length + work.inProgress.length + work.revision.length === 0 ? (
              "ไม่มีสิ่งที่ต้องดำเนินการตอนนี้"
            ) : (
              <>
                {[...work.inProgress, ...work.revision, ...work.ready].map((t) => (
                  <TaskCard key={t.id} task={t} />
                ))}
              </>
            )}
          </Panel>

          <Panel title="รอผู้อื่น" subtitle="งานที่ติดขัดซึ่งมอบหมายให้คุณ" empty={work.blocked.length === 0}>
            {work.blocked.length === 0
              ? "ไม่มีงานที่ติดขัดกับผู้อื่นตอนนี้"
              : work.blocked.map((t) => <TaskCard key={t.id} task={t} />)}
          </Panel>

          <Panel title="เสร็จสิ้นวันนี้" empty={work.completedToday.length === 0}>
            {work.completedToday.length === 0
              ? "ยังไม่มีงานที่เสร็จสิ้นวันนี้"
              : work.completedToday.map((t) => <TaskCard key={t.id} task={t} />)}
          </Panel>
        </div>

        <div className="grid gap-4">
          <Panel title="รอการอนุมัติจากคุณ" subtitle="คำขอให้ตรวจสอบ" empty={work.waitingApproval.length === 0}>
            {work.waitingApproval.length === 0
              ? "ไม่มีคำขออนุมัติที่รอดำเนินการ"
              : work.waitingApproval.map((t) => <TaskCard key={t.id} task={t} />)}
          </Panel>
        </div>
      </div>
    </div>
  );
}
