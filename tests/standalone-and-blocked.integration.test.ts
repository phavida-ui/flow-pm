import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { prisma } from "@/server/db";
import { createTask, startTask, markTaskBlocked, clearTaskBlocked } from "@/server/services/task.service";
import { submitTask } from "@/server/services/approval.service";
import { notify } from "@/server/services/notification.service";

const RUN_ID = Math.random().toString(36).slice(2, 8);
const email = (name: string) => `${name}.${RUN_ID}@test.flow`;

let ownerId: string;
const taskIds: string[] = [];

beforeAll(async () => {
  const owner = await prisma.user.create({
    data: { name: `standalone-owner-${RUN_ID}`, email: email("owner"), passwordHash: "x" },
  });
  ownerId = owner.id;
});

afterAll(async () => {
  await prisma.activityLog.deleteMany({ where: { taskId: { in: taskIds } } });
  await prisma.notification.deleteMany({ where: { taskId: { in: taskIds } } });
  await prisma.approval.deleteMany({ where: { taskId: { in: taskIds } } });
  await prisma.task.deleteMany({ where: { id: { in: taskIds } } });
  await prisma.user.delete({ where: { id: ownerId } });
});

describe("standalone task (no campaign)", () => {
  it("defaults to READY with no campaign, bypassing Ready Check", async () => {
    const task = await createTask({ name: `Call supplier ${RUN_ID}`, ownerId, createdBy: ownerId });
    taskIds.push(task.id);

    expect(task.campaignId).toBeNull();
    expect(task.status).toBe("READY");
  });

  it("supports Ready → Doing, mark/clear ติดปัญหา, then Done with no approver and no crash", async () => {
    const task = await createTask({ name: `Update pricing ${RUN_ID}`, ownerId, createdBy: ownerId });
    taskIds.push(task.id);

    await startTask(task.id, ownerId);
    const inProgress = await prisma.task.findUniqueOrThrow({ where: { id: task.id } });
    expect(inProgress.status).toBe("IN_PROGRESS");

    await markTaskBlocked(task.id, ownerId, "WAITING_PERSON", "waiting on finance");
    const blocked = await prisma.task.findUniqueOrThrow({ where: { id: task.id } });
    expect(blocked.blockedReason).toBe("WAITING_PERSON");
    expect(blocked.blockedAt).not.toBeNull();

    await clearTaskBlocked(task.id, ownerId);
    const cleared = await prisma.task.findUniqueOrThrow({ where: { id: task.id } });
    expect(cleared.blockedReason).toBeNull();
    expect(cleared.blockedAt).toBeNull();

    await markTaskBlocked(task.id, ownerId, "OTHER", null);

    await submitTask(task.id, ownerId);
    const done = await prisma.task.findUniqueOrThrow({ where: { id: task.id } });
    expect(done.status).toBe("COMPLETED");
    expect(done.blockedReason).toBeNull();
    expect(done.blockedAt).toBeNull();

    const handoffs = await prisma.taskHandoff.findMany({ where: { fromTaskId: task.id } });
    expect(handoffs).toHaveLength(0);
  });
});

describe("notify dedupe", () => {
  it("only inserts one unread notification when dedupe:true and called twice", async () => {
    const task = await createTask({ name: `Dedupe test ${RUN_ID}`, ownerId, createdBy: ownerId });
    taskIds.push(task.id);

    const params = {
      userId: ownerId,
      type: "TASK_READY" as const,
      taskId: task.id,
      title: "พร้อมเริ่มงาน",
      message: "test",
      dedupe: true,
    };
    await notify(prisma, params);
    await notify(prisma, params);

    const count = await prisma.notification.count({
      where: { userId: ownerId, taskId: task.id, type: "TASK_READY", isRead: false },
    });
    expect(count).toBe(1);
  });
});
