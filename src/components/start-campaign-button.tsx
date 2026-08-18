"use client";

import { useActionState } from "react";
import { startCampaignAction, type ActionState } from "@/app/actions/campaign";

export function StartCampaignButton({ campaignId, disabled }: { campaignId: string; disabled: boolean }) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    async () => startCampaignAction(campaignId),
    undefined
  );

  return (
    <form action={formAction}>
      <button
        type="submit"
        disabled={disabled || pending}
        className="h-11 w-full rounded-[11px] bg-primary text-[13px] font-extrabold text-[#173f5c] hover:bg-primary-strong disabled:cursor-not-allowed disabled:opacity-40"
      >
        {pending ? "กำลังเริ่ม…" : "เริ่มแคมเปญ"}
      </button>
      {state?.error && <p className="mt-2 text-center text-xs font-semibold text-red">{state.error}</p>}
    </form>
  );
}
