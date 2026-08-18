import { Check, X } from "lucide-react";
import { requireRole } from "@/server/auth";
import { prisma } from "@/server/db";
import { runReadyCheck } from "@/server/services/campaign.service";
import { PageHeader } from "@/components/page-header";
import { StartCampaignButton } from "@/components/start-campaign-button";

const CHECK_LABELS: Record<string, string> = {
  hasOwner: "แคมเปญมีคนรับผิดชอบ",
  hasTargetDate: "แคมเปญมีวันเป้าหมาย",
  allTasksHaveOwner: "งานทุกงานมีคนรับผิดชอบ",
  allTasksHaveDueDate: "งานทุกงานมีกำหนดส่ง",
  noDependencyCycles: "ไม่พบการพึ่งพากันแบบวนลูป",
  atLeastOneStartable: "มีอย่างน้อยหนึ่งงานที่เริ่มได้",
};

export default async function ReadyCheckPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await requireRole("ADMIN", "MANAGER");

  const [campaign, result] = await Promise.all([
    prisma.campaign.findUniqueOrThrow({ where: { id } }),
    runReadyCheck(id),
  ]);

  return (
    <div>
      <PageHeader eyebrow={campaign.name} title="ตรวจความพร้อม" />

      <div className="mx-auto max-w-xl rounded-[18px] border border-line bg-white p-6">
        <div className="grid gap-2.5">
          {Object.entries(result.checks).map(([key, passed]) => (
            <div key={key} className="flex items-center gap-2.5 rounded-[10px] border border-line px-3.5 py-2.5">
              {passed ? <Check size={15} className="text-green" /> : <X size={15} className="text-red" />}
              <span className="text-[12px] font-semibold">{CHECK_LABELS[key] ?? key}</span>
            </div>
          ))}
        </div>

        <div className="my-5 flex justify-center gap-8 text-center">
          <div>
            <div className="text-lg font-extrabold">{result.stats.taskCount}</div>
            <div className="text-[9px] text-muted">งาน</div>
          </div>
          <div>
            <div className="text-lg font-extrabold">{result.stats.peopleCount}</div>
            <div className="text-[9px] text-muted">คน</div>
          </div>
          <div>
            <div className="text-lg font-extrabold">{result.stats.teamCount}</div>
            <div className="text-[9px] text-muted">ทีม</div>
          </div>
        </div>

        <StartCampaignButton campaignId={id} disabled={!result.passed} />
      </div>
    </div>
  );
}
