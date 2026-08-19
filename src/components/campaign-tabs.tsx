"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";

export function CampaignTabs({ campaignId }: { campaignId: string }) {
  const pathname = usePathname();
  const base = `/campaigns/${campaignId}`;
  const tabs = [
    { href: base, label: "แผนงาน" },
    { href: `${base}/board`, label: "บอร์ด" },
    { href: `${base}/timeline`, label: "ไทม์ไลน์" },
    { href: `${base}/activity`, label: "กิจกรรม" },
  ];

  return (
    <div className="mb-5 flex gap-1 border-b border-line">
      {tabs.map((t) => {
        const active = pathname === t.href;
        return (
          <Link
            key={t.href}
            href={t.href}
            className={clsx(
              "border-b-2 px-1 pb-3 text-[13px] font-bold",
              active ? "border-primary-strong text-[#1d2a3b]" : "border-transparent text-muted hover:text-[#1d2a3b]"
            )}
          >
            {t.label}
          </Link>
        );
      })}
    </div>
  );
}
