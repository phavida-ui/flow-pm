import type { BoardStage } from "@prisma/client";

export const BOARD_STAGE_ORDER: BoardStage[] = ["BRIEF", "DRAFT_1", "DRAFT_2", "DRAFT_3", "DONE"];

export const BOARD_STAGE_LABELS: Record<BoardStage, string> = {
  BRIEF: "รับบรีฟ",
  DRAFT_1: "ดราฟ 1",
  DRAFT_2: "ดราฟ 2",
  DRAFT_3: "ดราฟ 3",
  DONE: "เสร็จสิ้น",
};

export function nextBoardStage(stage: BoardStage): BoardStage | null {
  const i = BOARD_STAGE_ORDER.indexOf(stage);
  return i < BOARD_STAGE_ORDER.length - 1 ? BOARD_STAGE_ORDER[i + 1] : null;
}

export function prevBoardStage(stage: BoardStage): BoardStage | null {
  const i = BOARD_STAGE_ORDER.indexOf(stage);
  return i > 0 ? BOARD_STAGE_ORDER[i - 1] : null;
}
