import Link from "next/link";
import { requireUser, isManagerOrAdmin } from "@/server/auth";
import { prisma } from "@/server/db";
import { PageHeader } from "@/components/page-header";
import { NewTemplateDialog } from "@/components/new-template-dialog";

export default async function WorkflowsPage() {
  const user = await requireUser();
  const templates = await prisma.workflowTemplate.findMany({
    include: { _count: { select: { tasks: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <PageHeader eyebrow="เวิร์กโฟลว์" title="เทมเพลตเวิร์กโฟลว์" actions={isManagerOrAdmin(user) ? <NewTemplateDialog /> : undefined} />

      {templates.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line bg-white p-10 text-center text-sm text-muted">
          ยังไม่มีเทมเพลต
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4 max-[900px]:grid-cols-1">
          {templates.map((t) => (
            <Link key={t.id} href={`/workflows/${t.id}`} className="grid gap-2 rounded-[17px] border border-line bg-white p-5 hover:border-[#c7e6fa]">
              <h3 className="text-[14px] font-extrabold">{t.name}</h3>
              <p className="text-[11px] text-muted">{t.description ?? "ไม่มีคำอธิบาย"}</p>
              <span className="mt-2 text-[10px] font-bold text-primary-strong">{t._count.tasks} งาน</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
