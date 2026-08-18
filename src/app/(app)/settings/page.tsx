import { requireUser } from "@/server/auth";
import { prisma } from "@/server/db";
import { PageHeader } from "@/components/page-header";
import { Avatar } from "@/components/avatar";

export default async function SettingsPage() {
  const user = await requireUser();
  const team = user.teamId ? await prisma.team.findUnique({ where: { id: user.teamId } }) : null;

  return (
    <div>
      <PageHeader eyebrow="Settings" title="Your account" />
      <div className="max-w-md rounded-[17px] border border-line bg-white p-6">
        <div className="flex items-center gap-3">
          <Avatar name={user.name} size={44} />
          <div>
            <strong className="block text-sm">{user.name}</strong>
            <span className="text-xs text-muted">{user.email}</span>
          </div>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-3 text-[11px]">
          <div>
            <span className="block text-[9px] font-bold text-muted">Role</span>
            <strong>{user.role}</strong>
          </div>
          <div>
            <span className="block text-[9px] font-bold text-muted">Team</span>
            <strong>{team?.name ?? "—"}</strong>
          </div>
          <div>
            <span className="block text-[9px] font-bold text-muted">Can approve tasks</span>
            <strong>{user.isApprover ? "Yes" : "No"}</strong>
          </div>
        </div>
      </div>
    </div>
  );
}
