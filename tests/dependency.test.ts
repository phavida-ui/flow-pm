import { describe, expect, it } from "vitest";
import {
  computeUnblockedTaskIds,
  hasCycle,
  wouldCreateCycle,
} from "@/server/services/dependency.service";

describe("computeUnblockedTaskIds", () => {
  it("unblocks B once its single dependency A is completed", () => {
    const edges = [{ taskId: "B", dependsOnTaskId: "A" }];
    const unblocked = computeUnblockedTaskIds(["A", "B"], edges, new Set(["A"]));
    expect(unblocked.has("B")).toBe(true);
  });

  it("keeps D blocked until ALL of A, B, C are completed", () => {
    const edges = [
      { taskId: "D", dependsOnTaskId: "A" },
      { taskId: "D", dependsOnTaskId: "B" },
      { taskId: "D", dependsOnTaskId: "C" },
    ];
    const partial = computeUnblockedTaskIds(["A", "B", "C", "D"], edges, new Set(["A", "B"]));
    expect(partial.has("D")).toBe(false);

    const full = computeUnblockedTaskIds(["A", "B", "C", "D"], edges, new Set(["A", "B", "C"]));
    expect(full.has("D")).toBe(true);
  });
});

describe("wouldCreateCycle", () => {
  it("rejects A -> B -> C -> A", () => {
    const edges = [
      { taskId: "B", dependsOnTaskId: "A" },
      { taskId: "C", dependsOnTaskId: "B" },
    ];
    expect(wouldCreateCycle(edges, { taskId: "A", dependsOnTaskId: "C" })).toBe(true);
  });

  it("allows a non-cyclic addition", () => {
    const edges = [{ taskId: "B", dependsOnTaskId: "A" }];
    expect(wouldCreateCycle(edges, { taskId: "C", dependsOnTaskId: "B" })).toBe(false);
  });

  it("rejects a task depending on itself", () => {
    expect(wouldCreateCycle([], { taskId: "A", dependsOnTaskId: "A" })).toBe(true);
  });
});

describe("hasCycle", () => {
  it("detects a cycle across a full graph", () => {
    const edges = [
      { taskId: "B", dependsOnTaskId: "A" },
      { taskId: "C", dependsOnTaskId: "B" },
      { taskId: "A", dependsOnTaskId: "C" },
    ];
    expect(hasCycle(edges)).toBe(true);
  });

  it("returns false for an acyclic diamond graph", () => {
    const edges = [
      { taskId: "B", dependsOnTaskId: "A" },
      { taskId: "C", dependsOnTaskId: "A" },
      { taskId: "D", dependsOnTaskId: "B" },
      { taskId: "D", dependsOnTaskId: "C" },
    ];
    expect(hasCycle(edges)).toBe(false);
  });
});
