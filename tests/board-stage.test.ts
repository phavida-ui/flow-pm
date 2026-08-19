import { describe, expect, it } from "vitest";
import { BOARD_STAGE_ORDER, BOARD_STAGE_LABELS, nextBoardStage, prevBoardStage } from "@/lib/board-stage";

describe("board stage ordering", () => {
  it("has a non-empty Thai label for every stage", () => {
    for (const stage of BOARD_STAGE_ORDER) {
      expect(BOARD_STAGE_LABELS[stage]).toBeTruthy();
    }
  });

  it("moves forward through BRIEF -> DRAFT_1 -> DRAFT_2 -> DRAFT_3 -> DONE -> null", () => {
    expect(nextBoardStage("BRIEF")).toBe("DRAFT_1");
    expect(nextBoardStage("DRAFT_1")).toBe("DRAFT_2");
    expect(nextBoardStage("DRAFT_2")).toBe("DRAFT_3");
    expect(nextBoardStage("DRAFT_3")).toBe("DONE");
    expect(nextBoardStage("DONE")).toBeNull();
  });

  it("moves backward symmetrically, with BRIEF having no previous stage", () => {
    expect(prevBoardStage("DONE")).toBe("DRAFT_3");
    expect(prevBoardStage("DRAFT_1")).toBe("BRIEF");
    expect(prevBoardStage("BRIEF")).toBeNull();
  });
});
