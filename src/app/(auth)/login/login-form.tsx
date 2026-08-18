"use client";

import { useActionState } from "react";
import { loginAction, type LoginState } from "@/app/actions/auth";

export function LoginForm() {
  const [state, formAction, pending] = useActionState<LoginState, FormData>(loginAction, undefined);

  return (
    <form action={formAction} className="grid gap-4">
      <label className="grid gap-1.5">
        <span className="text-xs font-bold text-muted">Email</span>
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="jane@flow.demo"
          className="h-11 rounded-xl border border-line bg-white px-3 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary-soft"
        />
      </label>
      <label className="grid gap-1.5">
        <span className="text-xs font-bold text-muted">Password</span>
        <input
          name="password"
          type="password"
          required
          autoComplete="current-password"
          placeholder="••••••••"
          className="h-11 rounded-xl border border-line bg-white px-3 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary-soft"
        />
      </label>

      {state?.error && (
        <p className="rounded-lg bg-red-soft px-3 py-2 text-xs font-semibold text-red">{state.error}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="h-11 rounded-xl bg-primary text-sm font-bold text-[#173f5c] transition hover:bg-primary-strong disabled:opacity-60"
      >
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
