import { requireUser } from "@/server/auth";
import { getMyWork } from "@/server/services/task.service";
import { prisma } from "@/server/db";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { Panel } from "@/components/panel";
import { TaskCard } from "@/components/task-card";
import { QuickAddTaskDialog } from "@/components/quick-add-task-dialog";
import { DoingCard, ReadyCard, WaitingCard, UpcomingCard } from "@/components/my-work-cards";

export default async function MyWorkPage() {
  const user = await requireUser();

  const [work, campaigns, users] = await Promise.all([
    getMyWork(user.id),
    prisma.campaign.findMany({
      where: { status: { in: ["PLANNING", "DRAFT"] }, members: { some: { userId: user.id } } },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.user.findMany({ where: { active: true }, select: { id: true, name: true }, orderBy: { name: "asc" } }),
  ]);

  const eyebrow = new Intl.DateTimeFormat("th-TH", { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(
    new Date()
  );

  const doing = [...work.inProgress, ...work.revision];

  return (
    <div>
      <PageHeader
        eyebrow={eyebrow}
        title="งานของฉัน"
        actions={<QuickAddTaskDialog campaigns={campaigns} users={users} currentUser={{ id: user.id, name: user.name }} />}
      />

      <div className="mb-5 grid grid-cols-6 gap-2.5 max-[800px]:grid-cols-3">
        <StatCard label="กำลังทำ" value={doing.length} />
        <StatCard label="เริ่มได้แล้ว" value={work.ready.length} />
        <StatCard label="กำลังรอ" value={work.blocked.length} />
        <StatCard label="รออนุมัติ" value={work.waitingApproval.length} />
        <StatCard label="เกินกำหนด" value={work.overdue.length} tone="danger" />
        <StatCard label="งานถัดไป" value={work.upcoming.length} />
      </div>

      <div className="grid grid-cols-[1.35fr_.65fr] gap-4 max-[800px]:grid-cols-1">
        <div className="grid gap-4">
          <Panel title="กำลังทำ" empty={doing.length === 0}>
            {doing.length === 0 ? "ยังไม่มีงานที่กำลังทำอยู่" : doing.map((t) => <DoingCard key={t.id} task={t} />)}
          </Panel>

          <Panel title="เริ่มได้แล้ว" empty={work.ready.length === 0}>
            {work.ready.length === 0 ? "ยังไม่มีงานที่เริ่มได้ตอนนี้" : work.ready.map((t) => <ReadyCard key={t.id} task={t} />)}
          </Panel>

          <Panel title="กำลังรอ" empty={work.blocked.length === 0}>
            {work.blocked.length === 0 ? "ไม่มีงานที่ติดรออยู่ตอนนี้" : work.blocked.map((t) => <WaitingCard key={t.id} task={t} />)}
          </Panel>

          <Panel title="งานถัดไป" empty={work.upcoming.length === 0}>
            {work.upcoming.length === 0 ? "ไม่มีงานที่รออยู่ข้างหน้า" : work.upcoming.map((t) => <UpcomingCard key={t.id} task={t} />)}
          </Panel>
        </div>

        <div className="grid gap-4">
          <Panel title="รอการอนุมัติจากคุณ" subtitle="คำขอให้ตรวจสอบ" empty={work.waitingApproval.length === 0}>
            {work.waitingApproval.length === 0
              ? "ไม่มีคำขออนุมัติที่รอดำเนินการ"
              : work.waitingApproval.map((t) => <TaskCard key={t.id} task={t} />)}
          </Panel>

          <Panel title="เสร็จสิ้นวันนี้" empty={work.completedToday.length === 0}>
            {work.completedToday.length === 0
              ? "ยังไม่มีงานที่เสร็จสิ้นวันนี้"
              : work.completedToday.map((t) => <TaskCard key={t.id} task={t} />)}
          </Panel>
        </div>
      </div>
    </div>
  );
}
