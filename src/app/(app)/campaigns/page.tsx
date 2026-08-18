import { requireUser, isManagerOrAdmin } from "@/server/auth";
import { prisma } from "@/server/db";
import { listCampaignsForUser } from "@/server/services/campaign.service";
import { PageHeader } from "@/components/page-header";
import { CampaignCard } from "@/components/campaign-card";
import { NewCampaignDialog } from "@/components/new-campaign-dialog";

export default async function CampaignsPage() {
  const user = await requireUser();
  const [campaigns, users, templates] = await Promise.all([
    listCampaignsForUser(user.id, user.role),
    prisma.user.findMany({ where: { active: true }, select: { id: true, name: true }, orderBy: { name: "asc" } }),
    prisma.workflowTemplate.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
  ]);

  return (
    <div>
      <PageHeader
        eyebrow="Campaigns"
        title="Campaigns"
        actions={isManagerOrAdmin(user) ? <NewCampaignDialog users={users} templates={templates} /> : undefined}
      />

      {campaigns.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line bg-white p-10 text-center text-sm text-muted">
          No campaigns yet.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 max-[900px]:grid-cols-1">
          {campaigns.map((c) => (
            <CampaignCard key={c.id} campaign={c} />
          ))}
        </div>
      )}
    </div>
  );
}
