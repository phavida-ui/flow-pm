"use client";

import { useActionState } from "react";
import { updateOwnNameAction, changeOwnPasswordAction, type ActionState } from "@/app/actions/profile";

export function EditNameForm({ name }: { name: string }) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(updateOwnNameAction, undefined);

  return (
    <form action={formAction} className="grid gap-2">
      <label className="grid gap-1.5">
        <span className="text-[10px] font-bold text-muted">ชื่อ</span>
        <input
          name="name"
          required
          defaultValue={name}
          className="h-10 rounded-[10px] border border-line px-3 text-[12px] outline-none focus:border-primary focus:ring-4 focus:ring-primary-soft"
        />
      </label>
      {state?.error && <p className="text-[11px] font-semibold text-red">{state.error}</p>}
      {state?.success && <p className="text-[11px] font-semibold text-green">บันทึกชื่อแล้ว</p>}
      <div>
        <button
          type="submit"
          disabled={pending}
          className="h-9 rounded-[10px] bg-primary px-4 text-[11px] font-extrabold text-[#173f5c] disabled:opacity-60"
        >
          {pending ? "กำลังบันทึก…" : "บันทึกชื่อ"}
        </button>
      </div>
    </form>
  );
}

export function ChangePasswordForm() {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(changeOwnPasswordAction, undefined);

  return (
    <form action={formAction} className="grid gap-2.5">
      <label className="grid gap-1.5">
        <span className="text-[10px] font-bold text-muted">รหัสผ่านปัจจุบัน</span>
        <input
          name="currentPassword"
          type="password"
          required
          autoComplete="current-password"
          className="h-10 rounded-[10px] border border-line px-3 text-[12px] outline-none focus:border-primary focus:ring-4 focus:ring-primary-soft"
        />
      </label>
      <div className="grid grid-cols-2 gap-2.5">
        <label className="grid gap-1.5">
          <span className="text-[10px] font-bold text-muted">รหัสผ่านใหม่</span>
          <input
            name="newPassword"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            className="h-10 rounded-[10px] border border-line px-3 text-[12px] outline-none focus:border-primary focus:ring-4 focus:ring-primary-soft"
          />
        </label>
        <label className="grid gap-1.5">
          <span className="text-[10px] font-bold text-muted">ยืนยันรหัสผ่านใหม่</span>
          <input
            name="confirmPassword"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            className="h-10 rounded-[10px] border border-line px-3 text-[12px] outline-none focus:border-primary focus:ring-4 focus:ring-primary-soft"
          />
        </label>
      </div>
      {state?.error && <p className="text-[11px] font-semibold text-red">{state.error}</p>}
      {state?.success && <p className="text-[11px] font-semibold text-green">เปลี่ยนรหัสผ่านแล้ว</p>}
      <div>
        <button
          type="submit"
          disabled={pending}
          className="h-9 rounded-[10px] bg-primary px-4 text-[11px] font-extrabold text-[#173f5c] disabled:opacity-60"
        >
          {pending ? "กำลังบันทึก…" : "เปลี่ยนรหัสผ่าน"}
        </button>
      </div>
    </form>
  );
}
