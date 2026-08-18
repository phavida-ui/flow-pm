import { redirect } from "next/navigation";
import { getCurrentUser } from "@/server/auth";
import { prisma } from "@/server/db";
import { unreadCount as getUnreadCount } from "@/server/services/notification.service";
import { Sidebar } from "@/components/sidebar";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [team, approvalCount, unread] = await Promise.all([
    user.teamId ? prisma.team.findUnique({ where: { id: user.teamId } }) : null,
    user.isApprover ? prisma.task.count({ where: { approverId: user.id, status: "REVIEW" } }) : 0,
    getUnreadCount(user.id),
  ]);

  return (
    <div className="min-h-screen">
      <Sidebar
        user={{ name: user.name, role: user.role, teamName: team?.name ?? null }}
        approvalCount={approvalCount}
        unreadCount={unread}
      />
      <main className="ml-[232px] min-h-screen px-8 pb-16 max-[1000px]:ml-[76px] max-[800px]:px-4 max-[560px]:ml-0 max-[560px]:pb-24">
        {children}
      </main>
    </div>
  );
}
