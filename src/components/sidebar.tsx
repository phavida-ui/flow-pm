"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import { Home, LayoutGrid, CheckCircle2, GitBranch, Bell, Settings, LogOut, Users, BookOpen, LayoutList } from "lucide-react";
import { Avatar } from "@/components/avatar";
import { logoutAction } from "@/app/actions/auth";

const NAV = [
  { href: "/my-work", label: "งานของฉัน", icon: Home },
  { href: "/campaigns", label: "แคมเปญ", icon: LayoutGrid },
  { href: "/approvals", label: "การอนุมัติ", icon: CheckCircle2, badgeKey: "approvals" as const },
  { href: "/workflows", label: "เวิร์กโฟลว์", icon: GitBranch },
];

export function Sidebar({
  user,
  approvalCount,
  unreadCount,
}: {
  user: { name: string; title: string | null; role: string; teamName: string | null };
  approvalCount: number;
  unreadCount: number;
}) {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-20 flex w-[232px] flex-col border-r border-line bg-white p-4 max-[1000px]:w-[76px] max-[560px]:inset-x-0 max-[560px]:inset-y-auto max-[560px]:bottom-0 max-[560px]:h-16 max-[560px]:w-full max-[560px]:flex-row max-[560px]:items-center max-[560px]:border-r-0 max-[560px]:border-t max-[560px]:px-2">
      <div className="mb-7 flex items-center gap-2.5 px-2 max-[560px]:hidden">
        <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-base font-black text-[#20445f]">
          F
        </div>
        <div className="grid gap-0.5 max-[1000px]:hidden">
          <strong className="text-[15px] tracking-wide">FLOW</strong>
          <span className="text-[10px] text-muted">มองเห็นการส่งต่องานได้ชัดเจน</span>
        </div>
      </div>

      <nav className="grid gap-1.5 max-[560px]:grid-cols-4 max-[560px]:w-full">
        {[
          ...NAV,
          ...(user.role === "ADMIN" || user.role === "MANAGER"
            ? [{ href: "/team", label: "ทีม", icon: LayoutList }]
            : []),
          ...(user.role === "ADMIN" ? [{ href: "/admin/users", label: "ผู้ใช้งาน", icon: Users }] : []),
        ].map(({ href, label, icon: Icon, badgeKey }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          const badge = badgeKey === "approvals" ? approvalCount : 0;
          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                "grid grid-cols-[26px_1fr_auto] items-center gap-0 rounded-[13px] p-3 text-left text-[13px] font-bold text-[#667486] transition max-[1000px]:grid-cols-1 max-[1000px]:place-items-center max-[560px]:p-1.5",
                active ? "bg-primary-soft text-[#287eba]" : "hover:bg-[#f7fafc]"
              )}
            >
              <Icon size={17} />
              <span className="max-[1000px]:hidden max-[560px]:block max-[560px]:text-[9px]">{label}</span>
              {badge > 0 && (
                <span className="rounded-full bg-red-soft px-1.5 py-0.5 text-[9px] font-extrabold text-red max-[1000px]:hidden">
                  {badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto grid gap-1.5 max-[560px]:hidden">
        <Link
          href="/notifications"
          className="grid grid-cols-[26px_1fr_auto] items-center rounded-[13px] p-3 text-left text-[13px] font-bold text-[#667486] hover:bg-[#f7fafc] max-[1000px]:grid-cols-1 max-[1000px]:place-items-center"
        >
          <Bell size={17} />
          <span className="max-[1000px]:hidden">การแจ้งเตือน</span>
          {unreadCount > 0 && (
            <span className="rounded-full bg-red-soft px-1.5 py-0.5 text-[9px] font-extrabold text-red max-[1000px]:hidden">
              {unreadCount}
            </span>
          )}
        </Link>
        <Link
          href="/guide"
          className="grid grid-cols-[26px_1fr_auto] items-center rounded-[13px] p-3 text-left text-[13px] font-bold text-[#667486] hover:bg-[#f7fafc] max-[1000px]:grid-cols-1 max-[1000px]:place-items-center"
        >
          <BookOpen size={17} />
          <span className="max-[1000px]:hidden">วิธีใช้งาน</span>
        </Link>
        <Link
          href="/settings"
          className="grid grid-cols-[26px_1fr_auto] items-center rounded-[13px] p-3 text-left text-[13px] font-bold text-[#667486] hover:bg-[#f7fafc] max-[1000px]:grid-cols-1 max-[1000px]:place-items-center"
        >
          <Settings size={17} />
          <span className="max-[1000px]:hidden">ตั้งค่า</span>
        </Link>

        <div className="mt-1 flex items-center gap-2.5 border-t border-line pt-4 max-[1000px]:justify-center">
          <Avatar name={user.name} />
          <div className="grid gap-0.5 max-[1000px]:hidden">
            <strong className="text-xs">{user.name}</strong>
            <span className="text-[10px] text-muted">{user.title ?? user.teamName ?? user.role}</span>
          </div>
        </div>
        <form action={logoutAction} className="max-[1000px]:flex max-[1000px]:justify-center">
          <button
            type="submit"
            className="flex items-center gap-2 rounded-[13px] p-2 text-[11px] font-bold text-muted hover:bg-[#f7fafc]"
          >
            <LogOut size={14} /> <span className="max-[1000px]:hidden">ออกจากระบบ</span>
          </button>
        </form>
      </div>
    </aside>
  );
}
