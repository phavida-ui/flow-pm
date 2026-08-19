import { notFound } from "next/navigation";
import Link from "next/link";
import { requireUser, isManagerOrAdmin } from "@/server/auth";
import { prisma } from "@/server/db";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { PriorityBadge } from "@/components/priority-badge";
import { BlockedFlagBadge } from "@/components/blocked-flag-badge";
import { TaskActions } from "@/components/task-actions";
import { ReassignControls } from "@/components/reassign-controls";
import { CommentForm } from "@/components/comment-form";
import { SubtaskList } from "@/components/subtask-list";
import { AttachmentList } from "@/components/attachment-list";
import { formatDue, formatDateTime } from "@/lib/format";
import { Avatar } from "@/components/avatar";
import { listSubtasks } from "@/server/services/subtask.service";
import { listAttachments } from "@/server/services/attachment.service";

export default async function TaskDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser();

  const task = await prisma.task.findUnique({
    where: { id },
    include: {
      campaign: { select: { id: true, name: true, status: true } },
      team: { select: { name: true } },
      owner: { select: { id: true, name: true } },
      approver: { select: { id: true, name: true } },
      dependsOn: { include: { dependsOnTask: { select: { id: true, name: true, status: true, owner: { select: { name: true } } } } } },
      dependents: { include: { task: { select: { id: true, name: true, status: true, owner: { select: { name: true } } } } } },
      comments: { include: { user: { select: { name: true } } }, orderBy: { createdAt: "asc" } },
      approvals: { orderBy: { createdAt: "desc" }, take: 3 },
    },
  });

  if (!task) notFound();

  const [users, subtasks, attachments] = await Promise.all([
    prisma.user.findMany({ where: { active: true }, select: { id: true, name: true }, orderBy: { name: "asc" } }),
    listSubtasks(task.id),
    listAttachments(task.id),
  ]);

  const isOwner = task.ownerId === user.id;
  const isApprover = task.approverId === user.id;
  const canManage = isManagerOrAdmin(user);

  return (
    <div>
      <PageHeader eyebrow={task.campaign?.name ?? "งานเดี่ยว"} title={task.name} />

      <div className="grid grid-cols-[1.4fr_.6fr] gap-5 max-[900px]:grid-cols-1">
        <div className="grid gap-4">
          <div className="rounded-[17px] border border-line bg-white p-5">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <StatusBadge status={task.status} />
                <PriorityBadge priority={task.priority} />
                <BlockedFlagBadge blockedAt={task.blockedAt} blockedReason={task.blockedReason} />
              </div>
              {task.campaign ? (
                <Link href={`/campaigns/${task.campaign.id}`} className="text-[11px] font-bold text-primary-strong hover:underline">
                  {task.campaign.name}
                </Link>
              ) : (
                <span className="text-[11px] font-bold text-muted">งานเดี่ยว</span>
              )}
            </div>

            {task.description && <p className="mb-4 text-[12px] leading-relaxed text-[#3c4a5c]">{task.description}</p>}

            <div className="grid grid-cols-4 gap-3 text-[11px]">
              <div>
                <span className="block text-[9px] font-bold text-muted">คนรับผิดชอบ</span>
                <strong className="mt-1 block">{task.owner?.name ?? "ยังไม่มอบหมาย"}</strong>
              </div>
              <div>
                <span className="block text-[9px] font-bold text-muted">ทีม</span>
                <strong className="mt-1 block">{task.team?.name ?? "—"}</strong>
              </div>
              <div>
                <span className="block text-[9px] font-bold text-muted">ผู้อนุมัติ</span>
                <strong className="mt-1 block">{task.approver?.name ?? "ไม่ต้องอนุมัติ"}</strong>
              </div>
              <div>
                <span className="block text-[9px] font-bold text-muted">กำหนดส่ง</span>
                <strong className="mt-1 block">{task.dueDate ? formatDue(task.dueDate) : "—"}</strong>
              </div>
            </div>

            {canManage && (
              <div className="mt-4 border-t border-line pt-4">
                <ReassignControls taskId={task.id} campaignId={task.campaign?.id ?? null} ownerId={task.ownerId} approverId={task.approverId} users={users} />
              </div>
            )}
          </div>

          <AttachmentList taskId={task.id} attachments={attachments} currentUserId={user.id} />

          <div className="rounded-[17px] border border-line bg-white p-5">
            <TaskActions
              taskId={task.id}
              campaignId={task.campaign?.id ?? null}
              status={task.status}
              isOwner={isOwner}
              isApprover={isApprover}
              hasApprover={Boolean(task.approverId)}
              blockedReason={task.blockedReason}
              blockedNote={task.blockedNote}
              blockedAt={task.blockedAt}
            />
          </div>

          {task.approvals.length > 0 && task.approvals[0].comment && (
            <div className="rounded-[13px] bg-orange-soft px-4 py-3 text-[11px] font-semibold text-[#9a661c]">
              {task.approvals[0].comment}
            </div>
          )}

          <SubtaskList taskId={task.id} campaignId={task.campaign?.id ?? null} subtasks={subtasks} users={users} />

          <div className="rounded-[17px] border border-line bg-white p-5">
            <h3 className="mb-3 text-sm font-extrabold">ความคิดเห็น</h3>
            <div className="mb-3 grid gap-3">
              {task.comments.length === 0 && <p className="text-[11px] text-muted">ยังไม่มีความคิดเห็น</p>}
              {task.comments.map((c) => (
                <div key={c.id} className="flex gap-2.5">
                  <Avatar name={c.user.name} size={26} />
                  <div>
                    <div className="text-[11px]">
                      <strong>{c.user.name}</strong> <span className="text-muted">{formatDateTime(c.createdAt)}</span>
                    </div>
                    <p className="mt-0.5 text-[12px]">{c.body}</p>
                  </div>
                </div>
              ))}
            </div>
            <CommentForm taskId={task.id} campaignId={task.campaign?.id ?? null} />
          </div>
        </div>

        <div className="grid gap-4">
          <div className="rounded-[17px] border border-line bg-white p-4">
            <h4 className="mb-3 text-[10px] font-extrabold uppercase tracking-wide text-muted">งานที่ต้องทำก่อน</h4>
            {task.dependsOn.length === 0 ? (
              <p className="text-[11px] text-muted">ไม่มี — เริ่มงานนี้ได้ทุกเมื่อ</p>
            ) : (
              <div className="grid gap-2">
                {task.dependsOn.map((d) => (
                  <Link key={d.id} href={`/tasks/${d.dependsOnTask.id}`} className="block rounded-[11px] border border-line p-2.5 hover:bg-[#f9fbfd]">
                    <strong className="text-[11px]">{d.dependsOnTask.name}</strong>
                    <div className="mt-1 flex items-center justify-between">
                      <span className="text-[9px] text-muted">{d.dependsOnTask.owner?.name}</span>
                      <StatusBadge status={d.dependsOnTask.status} />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-[17px] border border-line bg-white p-4">
            <h4 className="mb-3 text-[10px] font-extrabold uppercase tracking-wide text-muted">งานที่รอต่อจากนี้</h4>
            {task.dependents.length === 0 ? (
              <p className="text-[11px] text-muted">ไม่มีใครรองานนี้อยู่</p>
            ) : (
              <div className="grid gap-2">
                {task.dependents.map((d) => (
                  <Link key={d.id} href={`/tasks/${d.task.id}`} className="block rounded-[11px] border border-line p-2.5 hover:bg-[#f9fbfd]">
                    <strong className="text-[11px]">{d.task.name}</strong>
                    <div className="mt-1 flex items-center justify-between">
                      <span className="text-[9px] text-muted">{d.task.owner?.name}</span>
                      {d.task.status === "BLOCKED" && task.status !== "COMPLETED" ? (
                        <span className="text-[9px] font-extrabold text-[#a86c1a]">รอคุณดำเนินการ</span>
                      ) : (
                        <StatusBadge status={d.task.status} />
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
