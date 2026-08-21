import { requireUser, isManagerOrAdmin } from "@/server/auth";
import { prisma } from "@/server/db";
import { PlanningBoard } from "@/components/planning-board";

export default async function CampaignPlanPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser();

  const [campaign, tasks, teams, users] = await Promise.all([
    prisma.campaign.findUniqueOrThrow({ where: { id } }),
    prisma.task.findMany({
      where: { campaignId: id, status: { not: "CANCELLED" } },
      include: {
        team: { select: { id: true, name: true } },
        owner: { select: { id: true, name: true } },
        approver: { select: { id: true, name: true } },
        dependsOn: { include: { dependsOnTask: { select: { id: true, name: true } } } },
      },
      orderBy: { createdAt: "asc" },
    }),
    prisma.team.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
    prisma.user.findMany({ where: { active: true }, select: { id: true, name: true }, orderBy: { name: "asc" } }),
  ]);

  const editable = campaign.status === "PLANNING" || campaign.status === "DRAFT";

  return (
    <PlanningBoard
      campaignId={id}
      campaignEditable={editable}
      canManage={isManagerOrAdmin(user)}
      tasks={tasks}
      teams={teams}
      users={users}
      currentUser={{ id: user.id, name: user.name }}
    />
  );
}
