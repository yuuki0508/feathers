"use client";

import { useActionState, useState } from "react";
import { adminLoginAction } from "@/lib/actions/admin/auth";

export function AdminLoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showAdminKey, setShowAdminKey] = useState(false);
  const [state, formAction, pending] = useActionState(adminLoginAction, null);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#1E1E2E] px-6">
      <div className="w-full max-w-[400px] rounded-[12px] border border-[#2E2E42] bg-[#252536] p-8">
        <div className="mb-8 text-center">
          <p className="text-lg font-medium tracking-wide text-white">ココロの羽 — 管理</p>
          <p className="mt-1 text-xs text-[#888]">Admin Panel</p>
        </div>

        <form action={formAction} className="flex flex-col gap-4">
          <div className="relative">
            <i className="ti ti-lock absolute left-3.5 top-1/2 -translate-y-1/2 text-lg text-[#C4866A]" />
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="パスワード"
              autoComplete="current-password"
              className="w-full rounded-lg border border-[#3A3A4E] bg-[#1E1E2E] py-3 pl-11 pr-11 text-sm text-white outline-none placeholder:text-[#666] focus:border-[#C4866A]"
            />
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-lg text-[#666]"
              aria-label={showPassword ? "パスワードを隠す" : "パスワードを表示"}
            >
              <i className={`ti ${showPassword ? "ti-eye-off" : "ti-eye"}`} />
            </button>
          </div>

          <div className="relative">
            <i className="ti ti-key absolute left-3.5 top-1/2 -translate-y-1/2 text-lg text-[#C4866A]" />
            <input
              name="admin_key"
              type={showAdminKey ? "text" : "password"}
              placeholder="管理用キー"
              autoComplete="off"
              className="w-full rounded-lg border border-[#3A3A4E] bg-[#1E1E2E] py-3 pl-11 pr-11 text-sm text-white outline-none placeholder:text-[#666] focus:border-[#C4866A]"
            />
            <button
              type="button"
              onClick={() => setShowAdminKey((value) => !value)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-lg text-[#666]"
              aria-label={showAdminKey ? "管理用キーを隠す" : "管理用キーを表示"}
            >
              <i className={`ti ${showAdminKey ? "ti-eye-off" : "ti-eye"}`} />
            </button>
          </div>

          {state?.error ? (
            <p className="text-center text-sm text-[#E8A090]">{state.error}</p>
          ) : null}

          <button
            type="submit"
            disabled={pending}
            className="mt-2 w-full rounded-lg bg-[#C4866A] py-3 text-sm tracking-wide text-white disabled:opacity-70"
          >
            {pending ? "..." : "ログイン"}
          </button>
        </form>
      </div>
    </div>
  );
}
