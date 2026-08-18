"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { clsx } from "clsx";
import { startTaskAction } from "@/app/actions/task";
import { submitTaskAction, resumeAfterRevisionAction } from "@/app/actions/approval";
import { PriorityBadge } from "@/components/priority-badge";
import { BlockedFlagBadge } from "@/components/blocked-flag-badge";
import { MarkBlockedControl } from "@/components/mark-blocked-control";
import { formatDue } from "@/lib/format";
import type { TaskStatus, TaskPriority, TaskBlockedReason } from "@prisma/client";

type CampaignRef = { id: string; name: string } | null;

type BaseTask = {
  id: string;
  name: string;
  status: TaskStatus;
  priority: TaskPriority | null;
  dueDate: Date | null;
  campaign: CampaignRef;
};

function CampaignLine({ campaign }: { campaign: CampaignRef }) {
  return <div className="text-[10px] text-muted">{campaign?.name ?? "งานเดี่ยว"}</div>;
}

function DueLine({ dueDate }: { dueDate: Date | null }) {
  if (!dueDate) return null;
  return <div className="text-[10px] text-muted">กำหนดส่ง {formatDue(dueDate)}</div>;
}

export function DoingCard({
  task,
}: {
  task: BaseTask & {
    approverId: string | null;
    blockedReason: TaskBlockedReason | null;
    blockedNote: string | null;
    blockedAt: Date | null;
  };
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function run(fn: () => Promise<{ error?: string } | undefined>) {
    setError(null);
    startTransition(async () => {
      const res = await fn();
      if (res?.error) setError(res.error);
    });
  }

  return (
    <div className="grid gap-3 rounded-[10px] border-b border-[#f0f3f6] px-2.5 py-3.5 last:border-b-0">
      <div className="flex items-start justify-between gap-3">
        <Link href={`/tasks/${task.id}`} className="min-w-0">
          <div className="truncate text-[13px] font-extrabold hover:text-primary-strong">{task.name}</div>
          <CampaignLine campaign={task.campaign} />
          <DueLine dueDate={task.dueDate} />
        </Link>
        <div className="flex flex-col items-end gap-1.5">
          {task.priority && <PriorityBadge priority={task.priority} />}
          <BlockedFlagBadge blockedAt={task.blockedAt} blockedReason={task.blockedReason} />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {task.status === "REVISION" ? (
          <button
            disabled={pending}
            className="h-10 rounded-[11px] bg-primary px-4 text-[12px] font-extrabold text-[#173f5c] disabled:opacity-60"
            onClick={() => run(() => resumeAfterRevisionAction(task.id, task.campaign?.id ?? null))}
          >
            ดำเนินงานต่อ
          </button>
        ) : (
          <>
            <button
              disabled={pending}
              className="h-10 rounded-[11px] bg-primary px-4 text-[12px] font-extrabold text-[#173f5c] disabled:opacity-60"
              onClick={() => run(() => submitTaskAction(task.id, task.campaign?.id ?? null))}
            >
              {task.approverId ? "ส่งตรวจสอบ" : "เสร็จแล้ว"}
            </button>
            <MarkBlockedControl
              taskId={task.id}
              campaignId={task.campaign?.id ?? null}
              blockedAt={task.blockedAt}
              blockedReason={task.blockedReason}
              blockedNote={task.blockedNote}
            />
          </>
        )}
      </div>

      {error && <p className="text-[11px] font-semibold text-red">{error}</p>}
    </div>
  );
}

export function ReadyCard({ task }: { task: BaseTask }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="grid gap-3 rounded-[10px] border-b border-[#f0f3f6] px-2.5 py-3.5 last:border-b-0">
      <div className="flex items-start justify-between gap-3">
        <Link href={`/tasks/${task.id}`} className="min-w-0">
          <div className="truncate text-[13px] font-extrabold hover:text-primary-strong">{task.name}</div>
          <CampaignLine campaign={task.campaign} />
          <DueLine dueDate={task.dueDate} />
        </Link>
        {task.priority && <PriorityBadge priority={task.priority} />}
      </div>
      <div>
        <button
          disabled={pending}
          className="h-10 rounded-[11px] bg-primary px-4 text-[12px] font-extrabold text-[#173f5c] disabled:opacity-60"
          onClick={() =>
            startTransition(async () => {
              setError(null);
              const res = await startTaskAction(task.id, task.campaign?.id ?? null);
              if (res?.error) setError(res.error);
            })
          }
        >
          เริ่มทำ
        </button>
      </div>
      {error && <p className="text-[11px] font-semibold text-red">{error}</p>}
    </div>
  );
}

type WaitingDep = {
  dependsOnTask: { id: string; name: string; status: TaskStatus; owner: { name: string } | null };
};

export function WaitingCard({ task }: { task: BaseTask & { dependsOn: WaitingDep[] } }) {
  const incomplete = task.dependsOn.filter((d) => d.dependsOnTask.status !== "COMPLETED");
  const first = incomplete[0]?.dependsOnTask;

  return (
    <Link
      href={`/tasks/${task.id}`}
      className="grid gap-2 rounded-[10px] border-b border-[#f0f3f6] px-2.5 py-3.5 last:border-b-0 hover:bg-[#f9fbfd]"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="truncate text-[13px] font-extrabold">{task.name}</div>
          <CampaignLine campaign={task.campaign} />
        </div>
        {task.priority && <PriorityBadge priority={task.priority} />}
      </div>

      {task.dependsOn.length > 0 && (
        <div className="grid gap-1">
          {task.dependsOn.map((d) => (
            <div key={d.dependsOnTask.id} className="flex items-center gap-1.5 text-[10px] text-muted">
              <span className={clsx(d.dependsOnTask.status === "COMPLETED" ? "text-green" : "text-[#98a3b3]")}>
                {d.dependsOnTask.status === "COMPLETED" ? "✓" : "○"}
              </span>
              <span>
                {d.dependsOnTask.name}
                {d.dependsOnTask.owner ? ` — ${d.dependsOnTask.owner.name}` : ""}
              </span>
            </div>
          ))}
        </div>
      )}

      {first && (
        <p className="text-[11px] font-bold text-[#a86c1a]">
          ยังรอ {first.name} จาก {first.owner?.name ?? "—"}
        </p>
      )}
    </Link>
  );
}

export function UpcomingCard({ task }: { task: BaseTask }) {
  return (
    <Link
      href={`/tasks/${task.id}`}
      className="grid gap-1 rounded-[10px] border-b border-[#f0f3f6] px-2.5 py-3.5 last:border-b-0 hover:bg-[#f9fbfd]"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="truncate text-[13px] font-bold text-[#59677a]">{task.name}</div>
          <CampaignLine campaign={task.campaign} />
        </div>
        {task.priority && <PriorityBadge priority={task.priority} />}
      </div>
      <DueLine dueDate={task.dueDate} />
    </Link>
  );
}
