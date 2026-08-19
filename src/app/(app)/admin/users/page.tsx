import { requireRole } from "@/server/auth";
import { listUsers, listTeams } from "@/server/services/user.service";
import { PageHeader } from "@/components/page-header";
import { UserManagementTable } from "@/components/user-management-table";
import { NewUserDialog } from "@/components/new-user-dialog";
import { NewTeamDialog } from "@/components/new-team-dialog";

export default async function AdminUsersPage() {
  const user = await requireRole("ADMIN");
  const [users, teams] = await Promise.all([listUsers(), listTeams()]);

  return (
    <div>
      <PageHeader
        eyebrow="ตั้งค่า"
        title="จัดการผู้ใช้งาน"
        actions={
          <div className="flex gap-2">
            <NewTeamDialog />
            <NewUserDialog teams={teams} />
          </div>
        }
      />
      <UserManagementTable users={users} teams={teams} currentUserId={user.id} />
    </div>
  );
}
