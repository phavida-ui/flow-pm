import Link from "next/link";
import { requireUser } from "@/server/auth";
import { prisma } from "@/server/db";
import { PageHeader } from "@/components/page-header";
import { Avatar } from "@/components/avatar";
import { EditNameForm, ChangePasswordForm } from "@/components/profile-settings";

export default async function SettingsPage() {
  const user = await requireUser();
  const team = user.teamId ? await prisma.team.findUnique({ where: { id: user.teamId } }) : null;

  return (
    <div>
      <PageHeader eyebrow="ตั้งค่า" title="บัญชีของคุณ" />
      <div className="max-w-md rounded-[17px] border border-line bg-white p-6">
        <div className="flex items-center gap-3">
          <Avatar name={user.name} size={44} />
          <div>
            <strong className="block text-sm">{user.name}</strong>
            {user.title && <span className="block text-[11px] font-semibold text-primary-strong">{user.title}</span>}
            <span className="text-xs text-muted">{user.email}</span>
          </div>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-3 text-[11px]">
          <div>
            <span className="block text-[9px] font-bold text-muted">บทบาท</span>
            <strong>{user.role}</strong>
          </div>
          <div>
            <span className="block text-[9px] font-bold text-muted">ทีม</span>
            <strong>{team?.name ?? "—"}</strong>
          </div>
          <div>
            <span className="block text-[9px] font-bold text-muted">สามารถอนุมัติงานได้</span>
            <strong>{user.isApprover ? "ใช่" : "ไม่ใช่"}</strong>
          </div>
        </div>
      </div>

      <div className="mt-4 grid max-w-md gap-4">
        <div className="rounded-[17px] border border-line bg-white p-6">
          <h3 className="mb-3 text-sm font-extrabold">แก้ไขชื่อ</h3>
          <EditNameForm name={user.name} />
        </div>

        <div className="rounded-[17px] border border-line bg-white p-6">
          <h3 className="mb-3 text-sm font-extrabold">เปลี่ยนรหัสผ่าน</h3>
          <ChangePasswordForm />
        </div>
      </div>

      {user.role === "ADMIN" && (
        <Link
          href="/admin/users"
          className="mt-4 inline-flex h-10 items-center rounded-[11px] border border-line bg-white px-4 text-xs font-extrabold text-[#536174] hover:bg-[#f7fafc]"
        >
          จัดการผู้ใช้งาน
        </Link>
      )}
    </div>
  );
}
