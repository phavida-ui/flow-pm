"use client";

import { useTransition } from "react";
import Link from "next/link";
import { clsx } from "clsx";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Avatar } from "@/components/avatar";
import { StatusBadge } from "@/components/status-badge";
import { PriorityBadge } from "@/components/priority-badge";
import { TaskFormDialog } from "@/components/task-form-dialog";
import { moveBoardStageAction } from "@/app/actions/board";
import { BOARD_STAGE_ORDER, BOARD_STAGE_LABELS, nextBoardStage, prevBoardStage } from "@/lib/board-stage";
import type { BoardStage, TaskStatus, TaskPriority } from "@prisma/client";

type Option = { id: string; name: string };
type Task = {
  id: string;
  name: string;
  status: TaskStatus;
  priority: TaskPriority | null;
  boardStage: BoardStage;
  teamId: string | null;
  ownerId: string | null;
  approverId: string | null;
  dueDate: Date | null;
  owner: { id: string; name: string } | null;
};

export function KanbanBoard({
  campaignId,
  tasks,
  teams,
  users,
}: {
  campaignId: string;
  tasks: Task[];
  teams: Option[];
  users: Option[];
}) {
  const [pending, startTransition] = useTransition();

  function move(taskId: string, stage: BoardStage) {
    startTransition(() => moveBoardStageAction(taskId, campaignId, stage));
  }

  return (
    <div className="grid gap-2.5">
      <div className="flex items-center gap-2 text-[10px] font-bold text-muted">
        <span className="rounded-md bg-[#edf1f5] px-2 py-1">{BOARD_STAGE_LABELS.BRIEF}</span>
        <span>→</span>
        <span className="rounded-md bg-primary-soft px-2 py-1 text-[#2a81bc]">
          กำลังดำเนินการ ({BOARD_STAGE_LABELS.DRAFT_1} · {BOARD_STAGE_LABELS.DRAFT_2} · {BOARD_STAGE_LABELS.DRAFT_3})
        </span>
        <span>→</span>
        <span className="rounded-md bg-green-soft px-2 py-1 text-green">{BOARD_STAGE_LABELS.DONE}</span>
      </div>

      <div className="grid grid-cols-5 gap-3 max-[1100px]:grid-cols-1">
        {BOARD_STAGE_ORDER.map((stage) => {
          const columnTasks = tasks.filter((t) => t.boardStage === stage);
          const next = nextBoardStage(stage);
          const prev = prevBoardStage(stage);
          return (
            <div key={stage} className="grid gap-2 rounded-[14px] border border-line bg-[#f7fafc] p-2.5">
              <div className="flex items-center justify-between px-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wide text-[#59677a]">
                  {BOARD_STAGE_LABELS[stage]}
                </span>
                <span className="text-[9px] font-bold text-muted">{columnTasks.length}</span>
              </div>

              <div className="grid gap-2 min-h-[40px]">
                {columnTasks.map((t) => (
                  <div key={t.id} className="grid gap-2 rounded-[12px] border border-line bg-white p-3">
                    <div className="flex items-start justify-between gap-2">
                      <Link href={`/tasks/${t.id}`} className="text-[12px] font-bold hover:text-primary-strong">
                        {t.name}
                      </Link>
                      <TaskFormDialog
                        mode="edit"
                        campaignId={campaignId}
                        teams={teams}
                        users={users}
                        dependencyOptions={[]}
                        task={{
                          id: t.id,
                          name: t.name,
                          teamId: t.teamId,
                          ownerId: t.ownerId,
                          approverId: t.approverId,
                          dueDate: t.dueDate,
                          priority: t.priority,
                        }}
                      />
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <StatusBadge status={t.status} />
                      {t.priority && <PriorityBadge priority={t.priority} />}
                    </div>
                    {t.owner && (
                      <div className="flex items-center gap-1.5">
                        <Avatar name={t.owner.name} size={18} />
                        <span className="text-[10px] text-muted">{t.owner.name}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between pt-1">
                      <button
                        disabled={pending || !prev}
                        onClick={() => prev && move(t.id, prev)}
                        aria-label="ย้ายไปคอลัมน์ก่อนหน้า"
                        className={clsx(
                          "grid h-7 w-7 place-items-center rounded-lg border border-line",
                          prev ? "text-[#536174] hover:bg-[#f7fafc]" : "text-[#c7cfd8]"
                        )}
                      >
                        <ChevronLeft size={13} />
                      </button>
                      <button
                        disabled={pending || !next}
                        onClick={() => next && move(t.id, next)}
                        aria-label="ย้ายไปคอลัมน์ถัดไป"
                        className={clsx(
                          "grid h-7 w-7 place-items-center rounded-lg border border-line",
                          next ? "text-[#536174] hover:bg-[#f7fafc]" : "text-[#c7cfd8]"
                        )}
                      >
                        <ChevronRight size={13} />
                      </button>
                    </div>
                  </div>
                ))}
                {columnTasks.length === 0 && (
                  <div className="rounded-[12px] border border-dashed border-line p-3 text-center text-[10px] text-muted">
                    ไม่มีงาน
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
