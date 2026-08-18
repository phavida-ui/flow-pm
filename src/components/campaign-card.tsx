import Link from "next/link";
import { CampaignStatusBadge } from "@/components/campaign-status-badge";
import { formatDue } from "@/lib/format";

type CampaignCardData = {
  id: string;
  name: string;
  status: "DRAFT" | "PLANNING" | "READY_TO_START" | "ACTIVE" | "COMPLETED" | "CANCELLED";
  targetDate: Date | null;
  progress: { completed: number; total: number };
  currentHolders: { name: string; owner: { name: string } | null }[];
  waitingApproval: { name: string; approver: { name: string } | null }[];
  next?: { name: string; owner: { name: string } | null };
};

export function CampaignCard({ campaign }: { campaign: CampaignCardData }) {
  const pct = campaign.progress.total ? Math.round((campaign.progress.completed / campaign.progress.total) * 100) : 0;

  return (
    <Link href={`/campaigns/${campaign.id}`} className="grid gap-4 rounded-[18px] border border-line bg-white p-5 hover:border-[#c7e6fa]">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-[15px] font-extrabold">{campaign.name}</h3>
        <CampaignStatusBadge status={campaign.status} />
      </div>

      <div>
        <div className="flex justify-between text-[10px] font-bold text-muted">
          <span>Progress</span>
          <span>
            {campaign.progress.completed} / {campaign.progress.total} Tasks
          </span>
        </div>
        <div className="mt-2 h-[7px] overflow-hidden rounded-full bg-[#edf1f4]">
          <span className="block h-full rounded-full bg-primary-strong" style={{ width: `${pct}%` }} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 text-[11px]">
        <div>
          <span className="block text-[9px] font-bold text-muted">Current Holder</span>
          <strong className="mt-1 block truncate">
            {campaign.currentHolders[0]
              ? `${campaign.currentHolders[0].owner?.name ?? "—"} — ${campaign.currentHolders[0].name}`
              : "—"}
          </strong>
        </div>
        <div>
          <span className="block text-[9px] font-bold text-muted">Waiting Approval</span>
          <strong className="mt-1 block truncate">
            {campaign.waitingApproval[0]
              ? `${campaign.waitingApproval[0].approver?.name ?? "—"} — ${campaign.waitingApproval[0].name}`
              : "—"}
          </strong>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-line pt-3 text-[11px]">
        <div>
          <span className="block text-[9px] font-bold text-muted">Next</span>
          <strong>{campaign.next ? `${campaign.next.owner?.name ?? "—"} — ${campaign.next.name}` : "—"}</strong>
        </div>
        <div className="text-right">
          <span className="block text-[9px] font-bold text-muted">Target Date</span>
          <strong>{campaign.targetDate ? formatDue(campaign.targetDate) : "—"}</strong>
        </div>
      </div>
    </Link>
  );
}
