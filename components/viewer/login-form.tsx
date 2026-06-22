"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { HeartsAnimation } from "@/components/viewer/hearts-animation";
import { createClient } from "@/lib/supabase/client";
import { getAuthEmail } from "@/lib/auth/emails";

export function LoginForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (password.length === 0) {
      setError("パスワードを入力してください");
      return;
    }

    setPending(true);
    const supabase = createClient();
    const email = getAuthEmail();

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError("パスワードが正しくありません");
      setPending(false);
      return;
    }

    router.push("/");
    router.refresh();
  };

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[390px] flex-col items-center justify-center bg-cream px-8 py-10">
      <HeartsAnimation />
      <h1 className="font-display text-2xl tracking-wide text-accent">ココロの羽</h1>
      <p className="mt-1 text-[11px] tracking-widest text-text-sub">
        どんなに遠く離れても
      </p>

      <form onSubmit={handleSubmit} className="mt-12 flex w-full flex-col gap-4">
        <div className="relative">
          <i className="ti ti-lock absolute left-3.5 top-1/2 -translate-y-1/2 text-lg text-accent" />
          <input
            name="password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="パスワード"
            autoComplete="current-password"
            className="w-full rounded-2xl border border-border bg-card py-3.5 pl-11 pr-11 text-[15px] text-text outline-none placeholder:text-[#c9b0a0] focus:border-accent"
          />
          <button
            type="button"
            onClick={() => setShowPassword((value) => !value)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-lg text-text-muted"
            aria-label={showPassword ? "パスワードを隠す" : "パスワードを表示"}
          >
            <i className={`ti ${showPassword ? "ti-eye-off" : "ti-eye"}`} />
          </button>
        </div>

        {error ? <p className="text-center text-sm text-accent">{error}</p> : null}

        <button
          type="submit"
          disabled={pending}
          className="mt-2 w-full rounded-2xl bg-accent py-4 text-[15px] tracking-widest text-card disabled:opacity-70"
        >
          {pending ? "..." : "ひらく"}
        </button>
      </form>

      <p className="mt-6 text-center text-[11px] leading-relaxed text-text-muted">
        いつでもここで待ってるから
      </p>
    </div>
  );
}
