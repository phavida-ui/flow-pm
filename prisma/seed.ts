import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const DEMO_PASSWORD = "flow-demo-2026";

async function main() {
  console.log("Clearing existing data...");
  await prisma.$transaction([
    prisma.attachment.deleteMany(),
    prisma.comment.deleteMany(),
    prisma.activityLog.deleteMany(),
    prisma.notification.deleteMany(),
    prisma.taskHandoff.deleteMany(),
    prisma.approval.deleteMany(),
    prisma.taskDependency.deleteMany(),
    prisma.task.deleteMany(),
    prisma.campaignMember.deleteMany(),
    prisma.campaign.deleteMany(),
    prisma.workflowTemplateDependency.deleteMany(),
    prisma.workflowTemplateTask.deleteMany(),
    prisma.workflowTemplate.deleteMany(),
    prisma.user.deleteMany(),
    prisma.team.deleteMany(),
  ]);

  console.log("Seeding teams...");
  const [marketing, content, creative, performance] = await Promise.all([
    prisma.team.create({ data: { name: "Marketing" } }),
    prisma.team.create({ data: { name: "Content" } }),
    prisma.team.create({ data: { name: "Creative" } }),
    prisma.team.create({ data: { name: "Performance" } }),
  ]);

  console.log("Seeding users...");
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

  const [jane, ploy, nan, golf, beam, marketingHead, creativeLead, management] =
    await Promise.all([
      prisma.user.create({
        data: { name: "Jane", email: "jane@flow.demo", passwordHash, role: "MEMBER", teamId: marketing.id },
      }),
      prisma.user.create({
        data: { name: "Ploy", email: "ploy@flow.demo", passwordHash, role: "MEMBER", teamId: content.id },
      }),
      prisma.user.create({
        data: { name: "Nan", email: "nan@flow.demo", passwordHash, role: "MEMBER", teamId: creative.id },
      }),
      prisma.user.create({
        data: { name: "Golf", email: "golf@flow.demo", passwordHash, role: "MEMBER", teamId: performance.id },
      }),
      prisma.user.create({
        data: { name: "Beam", email: "beam@flow.demo", passwordHash, role: "MEMBER", teamId: performance.id },
      }),
      prisma.user.create({
        data: {
          name: "Marketing Head",
          email: "marketing.head@flow.demo",
          passwordHash,
          role: "MANAGER",
          isApprover: true,
          teamId: marketing.id,
        },
      }),
      prisma.user.create({
        data: {
          name: "Creative Lead",
          email: "creative.lead@flow.demo",
          passwordHash,
          role: "MEMBER",
          isApprover: true,
          teamId: creative.id,
        },
      }),
      prisma.user.create({
        data: {
          name: "Management",
          email: "management@flow.demo",
          passwordHash,
          role: "ADMIN",
          isApprover: true,
        },
      }),
    ]);

  console.log("Seeding Marketing Campaign workflow template...");
  const template = await prisma.workflowTemplate.create({
    data: { name: "Marketing Campaign", description: "Standard cross-functional campaign playbook", createdBy: management.id },
  });

  const templateTaskDefs = [
    { key: "promo", name: "Promotion Idea", teamId: marketing.id, seq: 1 },
    { key: "brief", name: "Creative Brief", teamId: marketing.id, seq: 2, deps: ["promo"] },
    { key: "script", name: "Write Script", teamId: content.id, seq: 3, deps: ["brief"] },
    { key: "landing", name: "Landing Page", teamId: marketing.id, seq: 4, deps: ["brief"] },
    { key: "audience", name: "Ads Audience", teamId: performance.id, seq: 5, deps: ["brief"] },
    { key: "shoot", name: "Shooting", teamId: creative.id, seq: 6, deps: ["script"] },
    { key: "edit", name: "Video Editing", teamId: creative.id, seq: 7, deps: ["shoot"] },
    { key: "adsetup", name: "Ads Setup", teamId: performance.id, seq: 8, deps: ["edit"] },
    { key: "launch", name: "Launch Ads", teamId: performance.id, seq: 9, deps: ["adsetup", "landing", "audience"] },
    { key: "report", name: "Performance Report", teamId: performance.id, seq: 10, deps: ["launch"] },
  ] as const;

  const templateTaskIds = new Map<string, string>();
  for (const def of templateTaskDefs) {
    const tt = await prisma.workflowTemplateTask.create({
      data: { templateId: template.id, name: def.name, defaultTeamId: def.teamId, sequence: def.seq },
    });
    templateTaskIds.set(def.key, tt.id);
  }
  for (const def of templateTaskDefs) {
    for (const depKey of (def as { deps?: readonly string[] }).deps ?? []) {
      await prisma.workflowTemplateDependency.create({
        data: { taskId: templateTaskIds.get(def.key)!, dependsOnTaskId: templateTaskIds.get(depKey)! },
      });
    }
  }

  console.log("Seeding Birthday Campaign 2026...");
  const campaign = await prisma.campaign.create({
    data: {
      name: "Birthday Campaign 2026",
      description: "Cross-functional campaign for the brand's birthday promotion.",
      ownerId: management.id,
      workflowTemplateId: template.id,
      status: "PLANNING",
      targetDate: new Date("2026-08-31"),
      createdBy: management.id,
    },
  });

  await prisma.campaignMember.createMany({
    data: [
      { campaignId: campaign.id, userId: management.id, role: "OWNER" },
      { campaignId: campaign.id, userId: marketingHead.id, role: "APPROVER" },
      { campaignId: campaign.id, userId: creativeLead.id, role: "APPROVER" },
      { campaignId: campaign.id, userId: jane.id, role: "MEMBER" },
      { campaignId: campaign.id, userId: ploy.id, role: "MEMBER" },
      { campaignId: campaign.id, userId: nan.id, role: "MEMBER" },
      { campaignId: campaign.id, userId: golf.id, role: "MEMBER" },
      { campaignId: campaign.id, userId: beam.id, role: "MEMBER" },
    ],
  });

  await prisma.activityLog.create({
    data: { campaignId: campaign.id, actorId: management.id, eventType: "CAMPAIGN_CREATED" },
  });

  const taskDefs = [
    { key: "promo", name: "Promotion Idea", team: marketing, owner: jane, approver: marketingHead, due: "2026-08-18", deps: [] as string[] },
    { key: "brief", name: "Creative Brief", team: marketing, owner: jane, approver: marketingHead, due: "2026-08-18", deps: ["promo"] },
    { key: "script", name: "Write Script", team: content, owner: ploy, approver: creativeLead, due: "2026-08-19", deps: ["brief"] },
    { key: "landing", name: "Landing Page", team: marketing, owner: jane, approver: marketingHead, due: "2026-08-20", deps: ["brief"] },
    { key: "audience", name: "Ads Audience", team: performance, owner: golf, approver: marketingHead, due: "2026-08-20", deps: ["brief"] },
    { key: "shoot", name: "Shooting", team: creative, owner: nan, approver: null, due: "2026-08-20", deps: ["script"] },
    { key: "edit", name: "Video Editing", team: creative, owner: nan, approver: creativeLead, due: "2026-08-21", deps: ["shoot"] },
    { key: "adsetup", name: "Ads Setup", team: performance, owner: golf, approver: marketingHead, due: "2026-08-21", deps: ["edit"] },
    { key: "launch", name: "Launch Ads", team: performance, owner: golf, approver: null, due: "2026-08-22", deps: ["adsetup", "landing", "audience"] },
    { key: "report", name: "Campaign Report", team: performance, owner: beam, approver: marketingHead, due: "2026-08-30", deps: ["launch"] },
  ];

  const taskIds = new Map<string, string>();
  for (const def of taskDefs) {
    const task = await prisma.task.create({
      data: {
        campaignId: campaign.id,
        name: def.name,
        teamId: def.team.id,
        ownerId: def.owner.id,
        approverId: def.approver?.id ?? null,
        dueDate: new Date(def.due),
        status: "PLANNED",
        createdBy: def.owner.id,
      },
    });
    taskIds.set(def.key, task.id);
    await prisma.activityLog.create({
      data: { campaignId: campaign.id, taskId: task.id, actorId: def.owner.id, eventType: "TASK_CREATED" },
    });
  }
  for (const def of taskDefs) {
    for (const depKey of def.deps) {
      await prisma.taskDependency.create({
        data: { taskId: taskIds.get(def.key)!, dependsOnTaskId: taskIds.get(depKey)! },
      });
    }
  }

  console.log("Starting campaign and driving it through a realistic mid-flight state...");

  // Import service functions lazily so this script stays a plain Node/tsx entrypoint.
  const { startCampaign } = await import("../src/server/services/campaign.service");
  const { startTask } = await import("../src/server/services/task.service");
  const { submitTask, approveTask } = await import("../src/server/services/approval.service");

  await startCampaign(campaign.id, management.id);

  async function completeChain(key: string, owner: { id: string }, approver: { id: string } | null) {
    const id = taskIds.get(key)!;
    await startTask(id, owner.id);
    if (approver) {
      await submitTask(id, owner.id);
      await approveTask(id, approver.id, "Looks good.");
    } else {
      await submitTask(id, owner.id); // no approver -> completes directly
    }
  }

  await completeChain("promo", jane, marketingHead);
  await completeChain("brief", jane, marketingHead);
  await completeChain("script", ploy, creativeLead);
  await completeChain("shoot", nan, null);

  // Video Editing: in progress (this is the "current holder" snapshot).
  await startTask(taskIds.get("edit")!, nan.id);

  // Ads Audience: submitted, sitting in the Approval Inbox.
  await startTask(taskIds.get("audience")!, golf.id);
  await submitTask(taskIds.get("audience")!, golf.id);

  // Landing Page: unblocked but not started yet (stays READY).

  console.log("Seed complete.");
  console.log(`Demo login password for every user: ${DEMO_PASSWORD}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
