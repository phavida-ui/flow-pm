"use client";

import { useActionState, useState } from "react";
import { Plus } from "lucide-react";
import { Dialog } from "@/components/dialog";
import { createCampaignAction, type ActionState } from "@/app/actions/campaign";

export function NewCampaignDialog({
  users,
  templates,
}: {
  users: { id: string; name: string }[];
  templates: { id: string; name: string }[];
}) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState<ActionState, FormData>(createCampaignAction, undefined);

  return (
    <Dialog
      open={open}
      onOpenChange={setOpen}
      trigger={
        <button className="inline-flex h-10 items-center gap-1.5 rounded-[11px] bg-primary px-4 text-xs font-extrabold text-[#173f5c] hover:bg-primary-strong">
          <Plus size={14} /> New Campaign
        </button>
      }
      eyebrow="New"
      title="Start a campaign"
    >
      <form action={formAction} className="grid gap-3.5 p-5">
        <label className="grid gap-1.5">
          <span className="text-[10px] font-extrabold text-[#59677a]">Campaign name</span>
          <input
            name="name"
            required
            placeholder="e.g. Birthday Campaign 2026"
            className="h-[41px] rounded-[10px] border border-line px-3 text-[11px] outline-none focus:border-primary focus:ring-4 focus:ring-primary-soft"
          />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="grid gap-1.5">
            <span className="text-[10px] font-extrabold text-[#59677a]">Owner</span>
            <select
              name="ownerId"
              required
              className="h-[41px] rounded-[10px] border border-line px-3 text-[11px] outline-none focus:border-primary"
            >
              <option value="">Select owner</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-1.5">
            <span className="text-[10px] font-extrabold text-[#59677a]">Target date</span>
            <input
              name="targetDate"
              type="date"
              className="h-[41px] rounded-[10px] border border-line px-3 text-[11px] outline-none focus:border-primary"
            />
          </label>
        </div>
        <label className="grid gap-1.5">
          <span className="text-[10px] font-extrabold text-[#59677a]">Start from a template (optional)</span>
          <select
            name="workflowTemplateId"
            className="h-[41px] rounded-[10px] border border-line px-3 text-[11px] outline-none focus:border-primary"
          >
            <option value="">Blank campaign</option>
            {templates.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </label>

        {state?.error && <p className="rounded-lg bg-red-soft px-3 py-2 text-xs font-semibold text-red">{state.error}</p>}

        <div className="mt-1 flex justify-end gap-2">
          <button
            type="submit"
            disabled={pending}
            className="h-10 rounded-[11px] bg-primary px-4 text-xs font-extrabold text-[#173f5c] hover:bg-primary-strong disabled:opacity-60"
          >
            {pending ? "Creating…" : "Create campaign"}
          </button>
        </div>
      </form>
    </Dialog>
  );
}
