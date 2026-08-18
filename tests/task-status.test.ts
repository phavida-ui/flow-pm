import { describe, expect, it } from "vitest";
import { toSimpleStatus, priorityRank } from "@/lib/task-status";

describe("toSimpleStatus", () => {
  it("maps READY to READY", () => {
    expect(toSimpleStatus({ status: "READY" })).toBe("READY");
  });

  it("maps BLOCKED to WAITING", () => {
    expect(toSimpleStatus({ status: "BLOCKED" })).toBe("WAITING");
  });

  it("maps IN_PROGRESS, REVIEW, and REVISION to DOING", () => {
    expect(toSimpleStatus({ status: "IN_PROGRESS" })).toBe("DOING");
    expect(toSimpleStatus({ status: "REVIEW" })).toBe("DOING");
    expect(toSimpleStatus({ status: "REVISION" })).toBe("DOING");
  });

  it("maps COMPLETED to DONE", () => {
    expect(toSimpleStatus({ status: "COMPLETED" })).toBe("DONE");
  });

  it("maps PLANNED and CANCELLED to null", () => {
    expect(toSimpleStatus({ status: "PLANNED" })).toBeNull();
    expect(toSimpleStatus({ status: "CANCELLED" })).toBeNull();
  });
});

describe("priorityRank", () => {
  it("orders URGENT < HIGH < MEDIUM < LOW < null", () => {
    expect(priorityRank("URGENT")).toBeLessThan(priorityRank("HIGH"));
    expect(priorityRank("HIGH")).toBeLessThan(priorityRank("MEDIUM"));
    expect(priorityRank("MEDIUM")).toBeLessThan(priorityRank("LOW"));
    expect(priorityRank("LOW")).toBeLessThan(priorityRank(null));
  });
});
