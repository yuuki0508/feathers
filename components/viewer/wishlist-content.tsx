"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  createWishlistItem,
  deleteWishlistItem,
  toggleWishlistItem,
  updateWishlistItem,
} from "@/lib/actions/wishlist";
import type { WishlistItem } from "@/lib/types/database";

type WishlistContentProps = {
  items: WishlistItem[];
};

export function WishlistContent({ items }: WishlistContentProps) {
  const router = useRouter();
  const [addError, setAddError] = useState<string | null>(null);
  const [editError, setEditError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editBody, setEditBody] = useState("");
  const [pending, startTransition] = useTransition();

  const handleAddSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAddError(null);

    const form = event.currentTarget;
    const formData = new FormData(form);
    startTransition(async () => {
      const result = await createWishlistItem(formData);
      if (result.error) {
        setAddError(result.error);
        return;
      }
      form.reset();
      router.refresh();
    });
  };

  const handleToggle = (item: WishlistItem) => {
    if (pending || editingId === item.id) return;

    startTransition(async () => {
      await toggleWishlistItem(item.id, !item.is_done);
      router.refresh();
    });
  };

  const startEdit = (item: WishlistItem) => {
    if (pending) return;
    setEditingId(item.id);
    setEditBody(item.body);
    setEditError(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditBody("");
    setEditError(null);
  };

  const handleSaveEdit = () => {
    if (!editingId) return;
    setEditError(null);

    startTransition(async () => {
      const result = await updateWishlistItem(editingId, editBody);
      if (result.error) {
        setEditError(result.error);
        return;
      }
      cancelEdit();
      router.refresh();
    });
  };

  const handleDelete = () => {
    if (!editingId) return;
    setEditError(null);

    startTransition(async () => {
      const result = await deleteWishlistItem(editingId);
      if (result.error) {
        setEditError(result.error);
        return;
      }
      cancelEdit();
      router.refresh();
    });
  };

  return (
    <>
      {items.length > 0 ? (
        <ul className="mb-8 space-y-2.5">
          {items.map((item) => {
            const isEditing = editingId === item.id;

            if (isEditing) {
              return (
                <li key={item.id}>
                  <div className="rounded-[18px] border border-border bg-card px-4 py-4">
                    <input
                      type="text"
                      value={editBody}
                      onChange={(event) => setEditBody(event.target.value)}
                      disabled={pending}
                      className="w-full rounded-2xl border border-border bg-[#fffaf7] px-4 py-3.5 text-sm text-text outline-none placeholder:text-[#c9b0a0] focus:border-accent"
                    />
                    {editError ? (
                      <p className="mt-2 text-center text-sm text-accent">{editError}</p>
                    ) : null}
                    <div className="mt-3 flex gap-2">
                      <button
                        type="button"
                        disabled={pending}
                        onClick={handleSaveEdit}
                        className="flex-1 rounded-2xl bg-accent py-3 text-sm tracking-wide text-card disabled:opacity-70"
                      >
                        {pending ? "..." : "保存する"}
                      </button>
                      <button
                        type="button"
                        disabled={pending}
                        onClick={cancelEdit}
                        className="flex-1 rounded-2xl border border-border bg-card py-3 text-sm text-text-sub disabled:opacity-70"
                      >
                        やめる
                      </button>
                    </div>
                    <button
                      type="button"
                      disabled={pending}
                      onClick={handleDelete}
                      className="mt-3 w-full py-1 text-center text-xs text-text-muted disabled:opacity-70"
                    >
                      削除
                    </button>
                  </div>
                </li>
              );
            }

            return (
              <li key={item.id}>
                <div
                  className={`flex items-center gap-2 rounded-[18px] border border-border bg-card px-3 py-3.5 ${
                    item.is_done ? "opacity-60" : ""
                  }`}
                >
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => handleToggle(item)}
                    aria-checked={item.is_done}
                    aria-label={item.is_done ? "未達成に戻す" : "達成にする"}
                    role="checkbox"
                    className="shrink-0 disabled:cursor-wait"
                  >
                    <span
                      className={`flex size-[22px] items-center justify-center rounded-full border transition-colors ${
                        item.is_done
                          ? "border-accent bg-accent"
                          : "border-[#e8d5c8] bg-[#fffaf7]"
                      }`}
                    >
                      {item.is_done ? (
                        <i className="ti ti-check text-[11px] text-card" />
                      ) : null}
                    </span>
                  </button>
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => handleToggle(item)}
                    className="min-w-0 flex-1 py-0.5 text-left disabled:cursor-wait"
                  >
                    <span
                      className={`text-sm leading-[1.8] ${
                        item.is_done ? "text-text-muted line-through" : "text-text"
                      }`}
                    >
                      {item.body}
                    </span>
                  </button>
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => startEdit(item)}
                    aria-label="編集"
                    className="shrink-0 px-1 py-1 text-text-muted disabled:cursor-wait"
                  >
                    <i className="ti ti-pencil text-base" />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="mb-8 rounded-[18px] border border-border bg-card px-5 py-8 text-center text-sm text-text-sub">
          まだやりたいことがありません。
        </p>
      )}

      <form onSubmit={handleAddSubmit} className="flex flex-col gap-2.5">
        <input
          name="body"
          type="text"
          placeholder="やりたいことを入力…"
          disabled={pending}
          className="w-full rounded-2xl border border-border bg-card px-4 py-3.5 text-sm text-text outline-none placeholder:text-[#c9b0a0] focus:border-accent"
        />
        {addError ? <p className="text-center text-sm text-accent">{addError}</p> : null}
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
