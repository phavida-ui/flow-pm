"use client";

import Link from "next/link";
import { useTransition } from "react";
import { clsx } from "clsx";
import { Bell, CheckCircle2, GitBranch, AlertTriangle } from "lucide-react";
import { markReadAction } from "@/app/actions/notification";
import { formatDateTime } from "@/lib/format";
import type { NotificationType } from "@prisma/client";

const ICONS: Record<NotificationType, React.ComponentType<{ size?: number }>> = {
  TASK_ASSIGNED: Bell,
  TASK_READY: CheckCircle2,
  APPROVAL_REQUIRED: CheckCircle2,
  REVISION_REQUESTED: AlertTriangle,
  TASK_OVERDUE: AlertTriangle,
  HANDOFF_RECEIVED: GitBranch,
};

export function NotificationItem({
  notification,
}: {
  notification: {
    id: string;
    type: NotificationType;
    title: string;
    message: string;
    isRead: boolean;
    createdAt: Date;
    taskId: string | null;
    campaignId: string | null;
  };
}) {
  const [, startTransition] = useTransition();
  const Icon = ICONS[notification.type] ?? Bell;
  const href = notification.taskId
    ? `/tasks/${notification.taskId}`
    : notification.campaignId
    ? `/campaigns/${notification.campaignId}`
    : "#";

  return (
    <Link
      href={href}
      onClick={() => !notification.isRead && startTransition(() => markReadAction(notification.id))}
      className={clsx(
        "grid grid-cols-[32px_1fr] gap-2.5 border-b border-[#eef2f5] px-5 py-3.5 last:border-b-0 hover:bg-[#f9fbfd]",
        !notification.isRead && "bg-[#f7fbff]"
      )}
    >
      <div className="grid h-[31px] w-[31px] place-items-center rounded-[9px] bg-primary-soft text-[#2c82bd]">
        <Icon size={15} />
      </div>
      <div>
        <strong className="text-[11px]">{notification.title}</strong>
        <p className="mt-1 text-[9px] leading-relaxed text-muted">{notification.message}</p>
        <time className="mt-1 block text-[8px] text-[#a5afbc]">{formatDateTime(notification.createdAt)}</time>
      </div>
    </Link>
  );
}
