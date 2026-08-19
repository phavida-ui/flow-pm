import { listBoardTasks } from "@/server/services/task.service";
import { KanbanBoard } from "@/components/kanban-board";

export default async function CampaignBoardPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const tasks = await listBoardTasks(id);

  return <KanbanBoard campaignId={id} tasks={tasks} />;
}
