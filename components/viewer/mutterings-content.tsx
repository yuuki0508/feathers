"use client";

import {
  createMuttering,
  createMutteringReply,
  deleteMuttering,
  deleteMutteringReply,
  updateMuttering,
  updateMutteringReply,
} from "@/lib/actions/mutterings";
import { formatRelativeTime } from "@/lib/format";
import {
  getReplyAuthorLabel,
  MUTTERING_MAX_LENGTH,
} from "@/lib/mutterings/constants";
import type { Muttering, MutteringReply, SessionActor } from "@/lib/types/database";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

type MutteringsContentProps = {
  mutterings: Muttering[];
  repliesByMutteringId: Record<string, MutteringReply[]>;
  actor: SessionActor;
};

function MutteringTextarea({
  value,
  onChange,
  placeholder,
  disabled,
  name,
}: {
  value?: string;
  onChange?: (value: string) => void;
  placeholder: string;
  disabled: boolean;
  name?: string;
}) {
  const length = value?.length ?? 0;

  return (
    <div>
      <textarea
        name={name}
        value={value}
        onChange={onChange ? (event) => onChange(event.target.value) : undefined}
        placeholder={placeholder}
        disabled={disabled}
        maxLength={MUTTERING_MAX_LENGTH}
        rows={3}
        className="w-full resize-none rounded-2xl border border-border bg-card px-4 py-3.5 text-sm leading-relaxed text-text outline-none placeholder:text-[#c9b0a0] focus:border-accent disabled:opacity-70"
      />
      {onChange ? (
        <p className="mt-1 text-right text-[10px] text-text-muted">
          {length}/{MUTTERING_MAX_LENGTH}
        </p>
      ) : null}
    </div>
  );
}

export function MutteringsContent({
  mutterings,
  repliesByMutteringId,
  actor,
}: MutteringsContentProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [postError, setPostError] = useState<string | null>(null);
  const [postBody, setPostBody] = useState("");
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editPostBody, setEditPostBody] = useState("");
  const [editPostError, setEditPostError] = useState<string | null>(null);
  const [editingReplyId, setEditingReplyId] = useState<string | null>(null);
  const [editReplyBody, setEditReplyBody] = useState("");
  const [editReplyError, setEditReplyError] = useState<string | null>(null);
  const [replyErrors, setReplyErrors] = useState<Record<string, string | null>>({});

  const canPost = actor === "viewer";

  const handlePostSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPostError(null);

    const formData = new FormData();
    formData.set("body", postBody);

    startTransition(async () => {
      const result = await createMuttering(formData);
      if (result.error) {
        setPostError(result.error);
        return;
      }
      setPostBody("");
      router.refresh();
    });
  };

  const startEditPost = (muttering: Muttering) => {
    if (pending || !canPost) return;
    setEditingPostId(muttering.id);
    setEditPostBody(muttering.body);
    setEditPostError(null);
  };

  const cancelEditPost = () => {
    setEditingPostId(null);
    setEditPostBody("");
    setEditPostError(null);
  };

  const handleSavePost = () => {
    if (!editingPostId) return;
    setEditPostError(null);

    startTransition(async () => {
      const result = await updateMuttering(editingPostId, editPostBody);
      if (result.error) {
        setEditPostError(result.error);
        return;
      }
      cancelEditPost();
      router.refresh();
    });
  };

  const handleDeletePost = () => {
    if (!editingPostId) return;
    setEditPostError(null);

    startTransition(async () => {
      const result = await deleteMuttering(editingPostId);
      if (result.error) {
        setEditPostError(result.error);
        return;
      }
      cancelEditPost();
      router.refresh();
    });
  };

  const handleReplySubmit = (mutteringId: string, event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setReplyErrors((current) => ({ ...current, [mutteringId]: null }));

    const form = event.currentTarget;
    const formData = new FormData(form);

    startTransition(async () => {
      const result = await createMutteringReply(mutteringId, formData);
      if (result.error) {
        setReplyErrors((current) => ({ ...current, [mutteringId]: result.error ?? null }));
        return;
      }
      form.reset();
      router.refresh();
    });
  };

  const startEditReply = (reply: MutteringReply) => {
    if (pending || reply.author_type !== actor) return;
    setEditingReplyId(reply.id);
    setEditReplyBody(reply.body);
    setEditReplyError(null);
  };

  const cancelEditReply = () => {
    setEditingReplyId(null);
    setEditReplyBody("");
    setEditReplyError(null);
  };

  const handleSaveReply = () => {
    if (!editingReplyId) return;
    setEditReplyError(null);

    startTransition(async () => {
      const result = await updateMutteringReply(editingReplyId, editReplyBody);
      if (result.error) {
        setEditReplyError(result.error);
        return;
      }
      cancelEditReply();
      router.refresh();
    });
  };

  const handleDeleteReply = () => {
    if (!editingReplyId) return;
    setEditReplyError(null);

    startTransition(async () => {
      const result = await deleteMutteringReply(editingReplyId);
      if (result.error) {
        setEditReplyError(result.error);
        return;
      }
      cancelEditReply();
      router.refresh();
    });
  };

  return (
    <>
      {mutterings.length > 0 ? (
        <ul className="space-y-4">
          {mutterings.map((muttering) => {
            const replies = repliesByMutteringId[muttering.id] ?? [];
            const isEditingPost = editingPostId === muttering.id;

            return (
              <li key={muttering.id}>
                <article className="rounded-[18px] border border-border bg-card px-4 py-4">
                  {isEditingPost ? (
                    <>
                      <MutteringTextarea
                        value={editPostBody}
                        onChange={setEditPostBody}
                        placeholder="つぶやき"
                        disabled={pending}
                      />
                      {editPostError ? (
                        <p className="mt-2 text-center text-sm text-accent">{editPostError}</p>
                      ) : null}
                      <div className="mt-3 flex gap-2">
                        <button
                          type="button"
                          disabled={pending}
                          onClick={handleSavePost}
                          className="flex-1 rounded-2xl bg-accent py-3 text-sm tracking-wide text-card disabled:opacity-70"
                        >
                          {pending ? "..." : "保存する"}
                        </button>
                        <button
                          type="button"
                          disabled={pending}
                          onClick={cancelEditPost}
                          className="flex-1 rounded-2xl border border-border bg-card py-3 text-sm text-text-sub disabled:opacity-70"
                        >
                          やめる
                        </button>
                      </div>
                      <button
                        type="button"
                        disabled={pending}
                        onClick={handleDeletePost}
                        className="mt-3 w-full py-1 text-center text-xs text-text-muted disabled:opacity-70"
                      >
                        削除
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="flex items-start gap-2">
                        <p className="min-w-0 flex-1 whitespace-pre-wrap text-sm leading-relaxed text-text">
                          {muttering.body}
                        </p>
                        {canPost ? (
                          <button
                            type="button"
                            disabled={pending}
                            onClick={() => startEditPost(muttering)}
                            aria-label="編集"
                            className="shrink-0 px-1 py-1 text-text-muted disabled:cursor-wait"
                          >
                            <i className="ti ti-pencil text-base" />
                          </button>
                        ) : null}
                      </div>
                      <p className="mt-2 text-[10px] text-text-muted">
                        {formatRelativeTime(muttering.created_at)}
                      </p>
                    </>
                  )}

                  {replies.length > 0 ? (
                    <ul className="mt-4 space-y-2 border-t border-border pt-4">
                      {replies.map((reply) => {
                        const isEditingReply = editingReplyId === reply.id;
                        const canEditReply = reply.author_type === actor;

                        if (isEditingReply) {
                          return (
                            <li key={reply.id}>
                              <MutteringTextarea
                                value={editReplyBody}
                                onChange={setEditReplyBody}
                                placeholder="返信"
                                disabled={pending}
                              />
                              {editReplyError ? (
                                <p className="mt-2 text-center text-sm text-accent">
                                  {editReplyError}
                                </p>
                              ) : null}
                              <div className="mt-3 flex gap-2">
                                <button
                                  type="button"
                                  disabled={pending}
                                  onClick={handleSaveReply}
                                  className="flex-1 rounded-2xl bg-accent py-3 text-sm tracking-wide text-card disabled:opacity-70"
                                >
                                  {pending ? "..." : "保存する"}
                                </button>
                                <button
                                  type="button"
                                  disabled={pending}
                                  onClick={cancelEditReply}
                                  className="flex-1 rounded-2xl border border-border bg-card py-3 text-sm text-text-sub disabled:opacity-70"
                                >
                                  やめる
                                </button>
                              </div>
                              <button
                                type="button"
                                disabled={pending}
                                onClick={handleDeleteReply}
                                className="mt-3 w-full py-1 text-center text-xs text-text-muted disabled:opacity-70"
                              >
                                削除
                              </button>
                            </li>
                          );
                        }

                        return (
                          <li
                            key={reply.id}
                            className="rounded-2xl bg-[#fffaf7] px-3 py-3"
                          >
                            <div className="flex items-start gap-2">
                              <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-accent text-[10px] font-medium text-card">
                                {getReplyAuthorLabel(reply.author_type)}
                              </span>
                              <div className="min-w-0 flex-1">
                                <p className="whitespace-pre-wrap text-sm leading-relaxed text-text">
                                  {reply.body}
                                </p>
                                <p className="mt-1.5 text-[10px] text-text-muted">
                                  {formatRelativeTime(reply.created_at)}
                                </p>
                              </div>
                              {canEditReply ? (
                                <button
                                  type="button"
                                  disabled={pending}
                                  onClick={() => startEditReply(reply)}
                                  aria-label="返信を編集"
                                  className="shrink-0 px-1 py-1 text-text-muted disabled:cursor-wait"
                                >
                                  <i className="ti ti-pencil text-sm" />
                                </button>
                              ) : null}
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  ) : null}

                  {!isEditingPost ? (
                    <form
                      onSubmit={(event) => handleReplySubmit(muttering.id, event)}
                      className="mt-4 flex flex-col gap-2 border-t border-border pt-4"
                    >
                      <textarea
                        name="body"
                        placeholder="返信を書く…"
                        disabled={pending}
                        maxLength={MUTTERING_MAX_LENGTH}
                        rows={2}
                        className="w-full resize-none rounded-2xl border border-border bg-[#fffaf7] px-4 py-3 text-sm leading-relaxed text-text outline-none placeholder:text-[#c9b0a0] focus:border-accent disabled:opacity-70"
                      />
                      {replyErrors[muttering.id] ? (
                        <p className="text-center text-sm text-accent">
                          {replyErrors[muttering.id]}
                        </p>
                      ) : null}
                      <button
                        type="submit"
                        disabled={pending}
                        className="self-end rounded-2xl bg-accent px-5 py-2.5 text-xs tracking-wide text-card disabled:opacity-70"
                      >
                        {pending ? "..." : "返信する"}
                      </button>
                    </form>
                  ) : null}
                </article>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="rounded-[18px] border border-border bg-card px-5 py-8 text-center text-sm text-text-sub">
          まだつぶやきがありません。
        </p>
      )}

      {canPost ? (
        <form onSubmit={handlePostSubmit} className="mt-6 flex flex-col gap-2.5">
          <MutteringTextarea
            value={postBody}
            onChange={setPostBody}
            placeholder="いまの気持ちをつぶやく…"
            disabled={pending}
          />
          {postError ? <p className="text-center text-sm text-accent">{postError}</p> : null}
          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-2xl bg-accent py-3.5 text-sm tracking-wide text-card disabled:opacity-70"
          >
            {pending ? "..." : "つぶやく"}
          </button>
        </form>
      ) : null}
    </>
  );
}
