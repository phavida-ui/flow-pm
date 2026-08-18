"use client";

import * as RadixDialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";

export function Dialog({
  trigger,
  title,
  eyebrow,
  children,
  open,
  onOpenChange,
}: {
  trigger?: React.ReactNode;
  title: string;
  eyebrow?: string;
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  return (
    <RadixDialog.Root open={open} onOpenChange={onOpenChange}>
      {trigger && <RadixDialog.Trigger asChild>{trigger}</RadixDialog.Trigger>}
      <RadixDialog.Portal>
        <RadixDialog.Overlay className="fixed inset-0 z-[80] bg-[#101c2c]/[0.26] data-[state=open]:animate-in data-[state=open]:fade-in" />
        <RadixDialog.Content className="fixed left-1/2 top-1/2 z-[81] w-[min(560px,92vw)] -translate-x-1/2 -translate-y-1/2 rounded-[18px] bg-white shadow-card focus:outline-none">
          <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-[18px]">
            <div>
              {eyebrow && <div className="text-[10px] font-extrabold text-[#98a3b3]">{eyebrow}</div>}
              <RadixDialog.Title className="text-lg font-extrabold">{title}</RadixDialog.Title>
            </div>
            <RadixDialog.Close className="grid h-9 w-9 place-items-center rounded-[10px] border border-line text-lg text-[#6f7b8d] hover:bg-[#f7fafc]">
              <X size={16} />
            </RadixDialog.Close>
          </div>
          {children}
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  );
}
