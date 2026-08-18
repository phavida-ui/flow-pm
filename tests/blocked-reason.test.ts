import { describe, expect, it } from "vitest";
import { BLOCKED_REASON_LABELS, BLOCKED_REASON_OPTIONS } from "@/lib/blocked-reason";

describe("BLOCKED_REASON_LABELS", () => {
  it("has a non-empty Thai label for every option", () => {
    for (const reason of BLOCKED_REASON_OPTIONS) {
      expect(BLOCKED_REASON_LABELS[reason]).toBeTruthy();
    }
  });
});
