import Link from "next/link";
import { clsx } from "clsx";
import { StatusBadge, isOverdue } from "@/components/status-badge";
import { formatDue } from "@/lib/format";
import type { TaskStatus } from "@prisma/client";

type Dependent = {
  task: { id: string; name: string; status: TaskStatus; ownerId: string | null; owner: { name: string } | null };
};

export function TaskCard({
  task,
}: {
  task: {
    id: string;
    name: string;
    status: TaskStatus;
    dueDate: Date | null;
    campaign: { id: string; name: string };
    dependents: Dependent[];
  };
}) {
  const overdue = isOverdue(task.dueDate, task.status);
  const nextTask = task.dependents[0]?.task;

  return (
    <Link
      href={`/tasks/${task.id}`}
      className="grid grid-cols-[1fr_auto] items-center gap-3.5 rounded-[10px] border-b border-[#f0f3f6] px-2.5 py-3.5 last:border-b-0 hover:bg-[#f9fbfd]"
    >
      <div>
        <div className="text-[13px] font-extrabold">{task.name}</div>
        <div className="mt-1 flex flex-wrap gap-2 text-[10px] text-muted">
          <span>{task.campaign.name}</span>
          {task.dueDate && (
            <span className={clsx(overdue && "font-bold text-red")}>
              {overdue ? "Overdue · " : "Due "}
              {formatDue(task.dueDate)}
            </span>
          )}
        </div>
        {nextTask && (
          <div className="mt-1.5 text-[10px] text-muted">
            Next: <strong className="font-bold text-[#59677a]">{nextTask.owner?.name ?? "—"} / {nextTask.name}</strong>
            {nextTask.status === "BLOCKED" && <span className="ml-1 font-extrabold text-[#a86c1a]">Waiting for you</span>}
          </div>
        )}
      </div>
      <StatusBadge status={task.status} />
    </Link>
  );
}
