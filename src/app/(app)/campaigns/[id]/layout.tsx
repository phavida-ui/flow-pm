import { notFound } from "next/navigation";
import { requireUser, isManagerOrAdmin } from "@/server/auth";
import { getCampaignDetail } from "@/server/services/campaign.service";
import { PageHeader } from "@/components/page-header";
import { CampaignStatusBadge } from "@/components/campaign-status-badge";
import { CampaignTabs } from "@/components/campaign-tabs";
import { formatDue } from "@/lib/format";
import Link from "next/link";

export default async function CampaignLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireUser();

  let detail;
  try {
    detail = await getCampaignDetail(id);
  } catch {
    notFound();
  }

  const { campaign, progress, currentWork, waitingApproval } = detail;
  const pct = progress.total ? Math.round((progress.completed / progress.total) * 100) : 0;
  const canManage = isManagerOrAdmin(user);

  return (
    <div>
      <PageHeader
        eyebrow="แคมเปญ"
        title={campaign.name}
        actions={
          canManage && (campaign.status === "PLANNING" || campaign.status === "READY_TO_START") ? (
            <Link
              href={`/campaigns/${campaign.id}/ready-check`}
              className="inline-flex h-10 items-center rounded-[11px] bg-primary px-4 text-xs font-extrabold text-[#173f5c] hover:bg-primary-strong"
            >
              ตรวจความพร้อม
            </Link>
          ) : undefined
        }
      />

      <div className="mb-5 grid grid-cols-[2fr_1fr_1fr_1fr] items-start gap-5 rounded-[18px] border border-line bg-white p-5 max-[900px]:grid-cols-1">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <CampaignStatusBadge status={campaign.status} />
            <span className="text-[10px] text-muted">เจ้าของ: {campaign.owner.name}</span>
          </div>
          <div className="flex justify-between text-[10px] font-bold text-muted">
            <span>ความคืบหน้า</span>
            <span>
              {progress.completed} / {progress.total} งาน
            </span>
          </div>
          <div className="mt-2 h-[7px] overflow-hidden rounded-full bg-[#edf1f4]">
            <span className="block h-full rounded-full bg-primary-strong" style={{ width: `${pct}%` }} />
          </div>
        </div>

        <div>
          <span className="block text-[9px] font-bold text-muted">งานปัจจุบัน</span>
          {currentWork.length === 0 ? (
            <span className="mt-1 block text-[11px] text-muted">—</span>
          ) : (
            currentWork.slice(0, 2).map((t) => (
              <div key={t.id} className="mt-1 text-[11px]">
                <strong>{t.owner?.name}</strong> — {t.name}
              </div>
            ))
          )}
        </div>

        <div>
          <span className="block text-[9px] font-bold text-muted">รออนุมัติ</span>
          {waitingApproval.length === 0 ? (
            <span className="mt-1 block text-[11px] text-muted">—</span>
          ) : (
            waitingApproval.slice(0, 2).map((t) => (
              <div key={t.id} className="mt-1 text-[11px]">
                <strong>{t.owner?.name}</strong> — {t.name}
              </div>
            ))
          )}
        </div>

        <div>
          <span className="block text-[9px] font-bold text-muted">วันเป้าหมาย</span>
          <strong className="mt-1 block text-[11px]">{campaign.targetDate ? formatDue(campaign.targetDate) : "—"}</strong>
        </div>
      </div>

      <CampaignTabs campaignId={campaign.id} />

      {children}
    </div>
  );
}
