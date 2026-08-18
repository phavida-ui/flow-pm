import Link from "next/link";
import { requireUser } from "@/server/auth";
import { getApprovalInbox } from "@/server/services/approval.service";
import { PageHeader } from "@/components/page-header";
import { Avatar } from "@/components/avatar";
import { formatDateTime, formatDue } from "@/lib/format";

export default async function ApprovalsPage() {
  const user = await requireUser();
  const inbox = await getApprovalInbox(user.id);

  return (
    <div>
      <PageHeader eyebrow="การอนุมัติ" title={`กล่องขออนุมัติ — รอ ${inbox.length} รายการ`} />

      {inbox.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line bg-white p-10 text-center text-sm text-muted">
          ไม่มีรายการรอการอนุมัติจากคุณ
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 max-[900px]:grid-cols-1">
          {inbox.map((t) => (
            <div key={t.id} className="grid gap-3 rounded-[18px] border border-line bg-white p-5">
              <div>
                <h3 className="text-[15px] font-extrabold">{t.name}</h3>
                <p className="mt-1 text-[11px] text-muted">{t.campaign?.name ?? "งานเดี่ยว"}</p>
              </div>

              <div className="flex items-center gap-2.5">
                <Avatar name={t.owner?.name ?? "?"} size={26} />
                <div className="text-[11px]">
                  <span className="block text-[9px] text-muted">ส่งโดย</span>
                  <strong>{t.owner?.name ?? "—"}</strong>
                </div>
              </div>

              <div className="flex justify-between text-[11px]">
                <div>
                  <span className="block text-[9px] text-muted">ส่งเมื่อ</span>
                  <strong>{t.submittedAt ? formatDateTime(t.submittedAt) : "—"}</strong>
                </div>
                <div className="text-right">
                  <span className="block text-[9px] text-muted">กำหนดส่ง</span>
                  <strong>{t.dueDate ? formatDue(t.dueDate) : "—"}</strong>
                </div>
              </div>

              <Link
                href={`/tasks/${t.id}`}
                className="inline-flex h-10 items-center justify-center rounded-[11px] bg-primary text-xs font-extrabold text-[#173f5c] hover:bg-primary-strong"
              >
                ตรวจสอบ
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
