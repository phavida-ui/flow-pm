import { prisma } from "@/server/db";
import { listBoardTasks } from "@/server/services/task.service";
import { KanbanBoard } from "@/components/kanban-board";

export default async function CampaignBoardPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [tasks, teams, users] = await Promise.all([
    listBoardTasks(id),
    prisma.team.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
    prisma.user.findMany({ where: { active: true }, select: { id: true, name: true }, orderBy: { name: "asc" } }),
  ]);

  return <KanbanBoard campaignId={id} tasks={tasks} teams={teams} users={users} />;
}
