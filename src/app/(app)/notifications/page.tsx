import { requireUser } from "@/server/auth";
import { listNotifications } from "@/server/services/notification.service";
import { PageHeader } from "@/components/page-header";
import { NotificationItem } from "@/components/notification-item";
import { MarkAllReadButton } from "@/components/mark-all-read-button";

export default async function NotificationsPage() {
  const user = await requireUser();
  const notifications = await listNotifications(user.id);
  const hasUnread = notifications.some((n) => !n.isRead);

  return (
    <div>
      <PageHeader eyebrow="การแจ้งเตือน" title="สิ่งที่คุณควรรู้" actions={hasUnread ? <MarkAllReadButton /> : undefined} />

      {notifications.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line bg-white p-10 text-center text-sm text-muted">
          คุณติดตามข้อมูลล่าสุดครบแล้ว
        </div>
      ) : (
        <div className="rounded-[17px] border border-line bg-white">
          {notifications.map((n) => (
            <NotificationItem key={n.id} notification={n} />
          ))}
        </div>
      )}
    </div>
  );
}
