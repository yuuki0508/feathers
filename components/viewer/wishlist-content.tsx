"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { createWishlistItem, toggleWishlistItem } from "@/lib/actions/wishlist";
import type { WishlistItem } from "@/lib/types/database";

type WishlistContentProps = {
  items: WishlistItem[];
};

export function WishlistContent({ items }: WishlistContentProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const form = event.currentTarget;
    const formData = new FormData(form);
    startTransition(async () => {
      const result = await createWishlistItem(formData);
      if (result.error) {
        setError(result.error);
        return;
      }
      form.reset();
      router.refresh();
    });
  };

  const handleToggle = (item: WishlistItem) => {
    startTransition(async () => {
      await toggleWishlistItem(item.id, !item.is_done);
      router.refresh();
    });
  };

  return (
    <>
      {items.length > 0 ? (
        <ul className="mb-8 space-y-2.5">
          {items.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                disabled={pending}
                onClick={() => handleToggle(item)}
                aria-checked={item.is_done}
                role="checkbox"
                className={`flex w-full cursor-pointer items-center gap-3.5 rounded-[18px] border border-border bg-card px-4 py-4 text-left transition-opacity disabled:cursor-wait ${
                  item.is_done ? "opacity-60" : ""
                }`}
              >
                <span
                  className={`flex size-[22px] shrink-0 items-center justify-center rounded-full border transition-colors ${
                    item.is_done
                      ? "border-accent bg-accent"
                      : "border-[#e8d5c8] bg-[#fffaf7]"
                  }`}
                  aria-hidden="true"
                >
                  {item.is_done ? (
                    <i className="ti ti-check text-[11px] text-card" />
                  ) : null}
                </span>
                <span
                  className={`text-sm leading-[1.8] ${
                    item.is_done ? "text-text-muted line-through" : "text-text"
                  }`}
                >
                  {item.body}
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mb-8 rounded-[18px] border border-border bg-card px-5 py-8 text-center text-sm text-text-sub">
          まだやりたいことがありません。
        </p>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-2.5">
        <input
          name="body"
          type="text"
          placeholder="やりたいことを入力…"
          disabled={pending}
          className="w-full rounded-2xl border border-border bg-card px-4 py-3.5 text-sm text-text outline-none placeholder:text-[#c9b0a0] focus:border-accent"
        />
        {error ? <p className="text-center text-sm text-accent">{error}</p> : null}
        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-2xl bg-accent py-3.5 text-sm tracking-wide text-card disabled:opacity-70"
        >
          {pending ? "..." : "追加する"}
        </button>
      </form>
    </>
  );
}
