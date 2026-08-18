import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { prisma } from "@/server/db";
import { addDependency, CycleError } from "@/server/services/dependency.service";
import { startTask } from "@/server/services/task.service";
import { submitTask, approveTask, requestRevision } from "@/server/services/approval.service";
import { createCampaign, startCampaign } from "@/server/services/campaign.service";

const RUN_ID = Math.random().toString(36).slice(2, 8);
const email = (name: string) => `${name}.${RUN_ID}@test.flow`;

let teamId: string;
let ownerA: { id: string };
let ownerB: { id: string };
let ownerX: { id: string };
let ownerY: { id: string };
let ownerZ: { id: string };
let ownerD: { id: string };
let approver: { id: string };
let campaignId: string;
let taskA: string;
let taskB: string;
let taskX: string;
let taskY: string;
let taskZ: string;
let taskD: string;
let taskApproved: string;
let taskRevision: string;

beforeAll(async () => {
  const team = await prisma.team.create({ data: { name: `Test Team ${RUN_ID}` } });
  teamId = team.id;

  const [a, b, x, y, z, d, appr] = await Promise.all(
    ["a", "b", "x", "y", "z", "d", "appr"].map((key) =>
      prisma.user.create({
        data: { name: key, email: email(key), passwordHash: "x", teamId },
      })
    )
  );
  ownerA = a;
  ownerB = b;
  ownerX = x;
  ownerY = y;
  ownerZ = z;
  ownerD = d;
  approver = appr;

  const campaign = await createCampaign({
    name: `Business Rules Test ${RUN_ID}`,
    ownerId: ownerA.id,
    targetDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    createdBy: ownerA.id,
  });
  campaignId = campaign.id;

  await prisma.campaignMember.createMany({
    data: [ownerB, ownerX, ownerY, ownerZ, ownerD, approver].map((u) => ({
      campaignId,
      userId: u.id,
      role: "MEMBER" as const,
    })),
  });

  const mkTask = (name: string, owner: { id: string }, approverId?: string) =>
    prisma.task
      .create({
        data: {
          campaignId,
          name,
          ownerId: owner.id,
          approverId: approverId ?? null,
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          status: "PLANNED",
          createdBy: owner.id,
        },
      })
      .then((t) => t.id);

  taskA = await mkTask("A", ownerA);
  taskB = await mkTask("B", ownerB);
  taskX = await mkTask("X", ownerX);
  taskY = await mkTask("Y", ownerY);
  taskZ = await mkTask("Z", ownerZ);
  taskD = await mkTask("D", ownerD);
  taskApproved = await mkTask("ApprovalFlow", ownerA, approver.id);
  taskRevision = await mkTask("RevisionFlow", ownerB, approver.id);

  await prisma.taskDependency.createMany({
    data: [
      { taskId: taskB, dependsOnTaskId: taskA },
      { taskId: taskD, dependsOnTaskId: taskX },
      { taskId: taskD, dependsOnTaskId: taskY },
      { taskId: taskD, dependsOnTaskId: taskZ },
    ],
  });

  await startCampaign(campaignId, ownerA.id);
}, 30000);

afterAll(async () => {
  await prisma.activityLog.deleteMany({ where: { campaignId } });
  await prisma.notification.deleteMany({ where: { campaignId } });
  await prisma.taskHandoff.deleteMany({ where: { campaignId } });
  await prisma.approval.deleteMany({ where: { task: { campaignId } } });
  await prisma.taskDependency.deleteMany({ where: { task: { campaignId } } });
  await prisma.task.deleteMany({ where: { campaignId } });
  await prisma.campaignMember.deleteMany({ where: { campaignId } });
  await prisma.campaign.delete({ where: { id: campaignId } });
  await prisma.user.deleteMany({
    where: { id: { in: [ownerA.id, ownerB.id, ownerX.id, ownerY.id, ownerZ.id, ownerD.id, approver.id] } },
  });
  await prisma.team.delete({ where: { id: teamId } });
  await prisma.$disconnect();
});

describe("single dependency", () => {
  it("unblocks B once A completes, and records a handoff + notification", async () => {
    expect((await prisma.task.findUniqueOrThrow({ where: { id: taskB } })).status).toBe("BLOCKED");

    await startTask(taskA, ownerA.id);
    await submitTask(taskA, ownerA.id); // no approver -> completes directly

    const b = await prisma.task.findUniqueOrThrow({ where: { id: taskB } });
    expect(b.status).toBe("READY");

    const handoff = await prisma.taskHandoff.findUnique({
      where: { fromTaskId_toTaskId: { fromTaskId: taskA, toTaskId: taskB } },
    });
    expect(handoff).not.toBeNull();

    const notification = await prisma.notification.findFirst({
      where: { taskId: taskB, userId: ownerB.id, type: "TASK_READY" },
    });
    expect(notification).not.toBeNull();
  });
});

describe("multiple dependency", () => {
  it("keeps D blocked until X, Y, and Z are all completed", async () => {
    await startTask(taskX, ownerX.id);
    await submitTask(taskX, ownerX.id);
    await startTask(taskY, ownerY.id);
    await submitTask(taskY, ownerY.id);

    expect((await prisma.task.findUniqueOrThrow({ where: { id: taskD } })).status).toBe("BLOCKED");

    await startTask(taskZ, ownerZ.id);
    await submitTask(taskZ, ownerZ.id);

    expect((await prisma.task.findUniqueOrThrow({ where: { id: taskD } })).status).toBe("READY");
  });
});

describe("approval flow", () => {
  it("moves a task with an approver through REVIEW to COMPLETED on approve", async () => {
    await startTask(taskApproved, ownerA.id);
    await submitTask(taskApproved, ownerA.id);
    expect((await prisma.task.findUniqueOrThrow({ where: { id: taskApproved } })).status).toBe("REVIEW");

    await approveTask(taskApproved, approver.id, "ship it");
    expect((await prisma.task.findUniqueOrThrow({ where: { id: taskApproved } })).status).toBe("COMPLETED");
  });
});

describe("revision flow", () => {
  it("moves REVIEW to REVISION on request-revision, with a comment", async () => {
    await startTask(taskRevision, ownerB.id);
    await submitTask(taskRevision, ownerB.id);

    await requestRevision(taskRevision, approver.id, "please fix the CTA copy");
    const task = await prisma.task.findUniqueOrThrow({ where: { id: taskRevision } });
    expect(task.status).toBe("REVISION");
  });
});

describe("circular dependency", () => {
  it("rejects a dependency that would close a cycle", async () => {
    // taskB already depends on taskA (from the single-dependency scenario above).
    await expect(addDependency(campaignId, taskA, taskB)).rejects.toThrow(CycleError);
  });
});

describe("campaign completion", () => {
  it("marks the campaign COMPLETED once every non-cancelled task is COMPLETED", async () => {
    // At this point: A, B(unstarted but READY), X, Y, Z, D(unstarted), ApprovalFlow are COMPLETED/READY;
    // RevisionFlow is in REVISION. Drive every remaining task to COMPLETED.
    await startTask(taskB, ownerB.id);
    await submitTask(taskB, ownerB.id);

    await startTask(taskD, ownerD.id);
    await submitTask(taskD, ownerD.id);

    await startTask(taskRevision, ownerB.id); // resume from REVISION
    await submitTask(taskRevision, ownerB.id);
    await approveTask(taskRevision, approver.id, "fixed, approved");

    const campaign = await prisma.campaign.findUniqueOrThrow({ where: { id: campaignId } });
    expect(campaign.status).toBe("COMPLETED");
  });
});
