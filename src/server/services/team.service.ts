import "server-only";
import { prisma } from "@/server/db";
import { priorityRank } from "@/lib/task-status";

export async function getTeamWorkload() {
  const [users, tasks] = await Promise.all([
    prisma.user.findMany({
      where: { active: true },
      select: { id: true, name: true, title: true, role: true, team: { select: { name: true } } },
      orderBy: { name: "asc" },
    }),
    prisma.task.findMany({
      where: { ownerId: { not: null }, status: { notIn: ["COMPLETED", "CANCELLED"] } },
      include: { campaign: { select: { id: true, name: true } } },
      orderBy: { dueDate: "asc" },
    }),
  ]);

  const tasksByOwner = new Map<string, typeof tasks>();
  for (const t of tasks) {
    if (!t.ownerId) continue;
    const list = tasksByOwner.get(t.ownerId) ?? [];
    list.push(t);
    tasksByOwner.set(t.ownerId, list);
  }

  const workload = users.map((u) => {
    const ownTasks = [...(tasksByOwner.get(u.id) ?? [])].sort((a, b) => {
      const rank = priorityRank(a.priority) - priorityRank(b.priority);
      if (rank !== 0) return rank;
      const aDue = a.dueDate?.getTime() ?? Infinity;
      const bDue = b.dueDate?.getTime() ?? Infinity;
      return aDue - bDue;
    });
    const overdueCount = ownTasks.filter((t) => t.dueDate && t.dueDate.getTime() < Date.now()).length;
    return { user: u, tasks: ownTasks, overdueCount };
  });

  // Busiest people first, so a manager sees who's overloaded immediately.
  workload.sort((a, b) => b.tasks.length - a.tasks.length);

  return workload;
}
