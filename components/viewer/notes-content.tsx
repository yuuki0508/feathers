"use client";

import {
  createNote,
  createNoteReply,
  deleteNote,
  deleteNoteReply,
  updateNote,
  updateNoteReply,
} from "@/lib/actions/notes";
import { compressFormImageFiles } from "@/lib/client/compress-image";
import { formatRelativeTime } from "@/lib/format";
import { getNoteAuthorLabel, NOTE_MAX_LENGTH } from "@/lib/notes/constants";
import type {
  NoteReplyWithPhotos,
  NoteWithPhotos,
  SessionActor,
} from "@/lib/types/database";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import {
  createExistingDraftPhoto,
  type DraftNotePhoto,
  NotePhotoComposer,
  revokeDraftPhotos,
} from "./note-photo-composer";
import { NotePhotoGrid } from "./note-photo-grid";

type NotesContentProps = {
  notes: NoteWithPhotos[];
  repliesByNoteId: Record<string, NoteReplyWithPhotos[]>;
  actor: SessionActor;
};

function AuthorBadge({ authorType }: { authorType: SessionActor }) {
  return (
    <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-accent text-[10px] font-medium text-card">
      {getNoteAuthorLabel(authorType)}
    </span>
  );
}

function AuthorMenu({
  disabled,
  onEdit,
  onDelete,
}: {
  disabled: boolean;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    window.addEventListener("pointerdown", handlePointerDown);
    return () => window.removeEventListener("pointerdown", handlePointerDown);
  }, [open]);

  return (
    <div ref={menuRef} className="relative shrink-0">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((current) => !current)}
        aria-label="操作"
        className="px-1 py-1 text-text-muted disabled:cursor-wait"
      >
        <i className="ti ti-dots-vertical text-base" />
      </button>
      {open ? (
        <div className="absolute right-0 top-7 z-20 min-w-28 overflow-hidden rounded-2xl border border-border bg-card py-1 shadow-[0_8px_24px_rgba(80,40,40,0.12)]">
          <button
            type="button"
            disabled={disabled}
            onClick={() => {
              setOpen(false);
              onEdit();
            }}
            className="flex w-full items-center gap-2 px-3.5 py-2.5 text-left text-sm text-text disabled:opacity-70"
          >
            <i className="ti ti-pencil text-sm" />
            編集
          </button>
          <button
            type="button"
            disabled={disabled}
            onClick={() => {
              setOpen(false);
              onDelete();
            }}
            className="flex w-full items-center gap-2 px-3.5 py-2.5 text-left text-sm text-accent disabled:opacity-70"
          >
            <i className="ti ti-trash text-sm" />
            削除
          </button>
        </div>
      ) : null}
    </div>
  );
}

function appendDraftPhotos(formData: FormData, photos: DraftNotePhoto[]) {
  for (const photo of photos) {
    if (photo.path) formData.append("keep_paths", photo.path);
    if (photo.file) formData.append("photos", photo.file);
  }
}

async function preparePhotoFormData(body: string, photos: DraftNotePhoto[]) {
  const formData = new FormData();
  formData.set("body", body);
  appendDraftPhotos(formData, photos);
  await compressFormImageFiles(formData, "photos", "写真");
  return formData;
}

function ComposeNoteModal({
  open,
  body,
  photos,
  error,
  pending,
  onBodyChange,
  onPhotosChange,
  onClose,
  onSubmit,
}: {
  open: boolean;
  body: string;
  photos: DraftNotePhoto[];
  error: string | null;
  pending: boolean;
  onBodyChange: (value: string) => void;
  onPhotosChange: (photos: DraftNotePhoto[]) => void;
  onClose: () => void;
  onSubmit: () => void;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!open) return;
    const timer = window.setTimeout(() => textareaRef.current?.focus(), 50);
    return () => window.clearTimeout(timer);
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const canSubmit = (body.trim().length > 0 || photos.length > 0) && !pending;

  return (
    <div className="fixed inset-0 z-[60] bg-cream">
      <div className="mx-auto flex h-full w-full max-w-[390px] flex-col">
        <header className="flex items-center justify-between border-b border-border px-4 py-3">
          <button
            type="button"
            onClick={onClose}
            disabled={pending}
            className="text-sm text-text-sub disabled:opacity-70"
          >
            キャンセル
          </button>
          <button
            type="button"
            onClick={onSubmit}
            disabled={!canSubmit}
            className="rounded-full bg-accent px-4 py-1.5 text-sm font-medium text-card disabled:opacity-50"
          >
            {pending ? "..." : "書く"}
          </button>
        </header>

        <div className="flex min-h-0 flex-1 flex-col px-5 py-4">
          <textarea
            ref={textareaRef}
            value={body}
            onChange={(event) => onBodyChange(event.target.value)}
            placeholder="いまのことを書く…"
            disabled={pending}
            maxLength={NOTE_MAX_LENGTH}
            className="min-h-24 flex-1 resize-none bg-transparent text-base leading-relaxed text-text outline-none placeholder:text-[#c9b0a0] disabled:opacity-70"
          />
          <div className="mt-3 min-h-0 overflow-y-auto">
            <NotePhotoComposer photos={photos} disabled={pending} onChange={onPhotosChange} />
          </div>
          <div className="mt-1 flex items-center justify-end border-t border-border pt-3">
            {error ? <p className="mr-auto text-sm text-accent">{error}</p> : null}
            <p className="text-[11px] tabular-nums text-text-muted">
              {body.length}/{NOTE_MAX_LENGTH}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function NotesContent({ notes, repliesByNoteId, actor }: NotesContentProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [postError, setPostError] = useState<string | null>(null);
  const [postBody, setPostBody] = useState("");
  const [postPhotos, setPostPhotos] = useState<DraftNotePhoto[]>([]);
  const [showCompose, setShowCompose] = useState(false);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editPostBody, setEditPostBody] = useState("");
  const [editPostPhotos, setEditPostPhotos] = useState<DraftNotePhoto[]>([]);
  const [editPostError, setEditPostError] = useState<string | null>(null);
  const [editingReplyId, setEditingReplyId] = useState<string | null>(null);
  const [editReplyBody, setEditReplyBody] = useState("");
  const [editReplyPhotos, setEditReplyPhotos] = useState<DraftNotePhoto[]>([]);
  const [editReplyError, setEditReplyError] = useState<string | null>(null);
  const [replyBodies, setReplyBodies] = useState<Record<string, string>>({});
  const [replyPhotos, setReplyPhotos] = useState<Record<string, DraftNotePhoto[]>>({});
  const [replyErrors, setReplyErrors] = useState<Record<string, string | null>>({});

  const openCompose = () => {
    if (pending) return;
    setPostError(null);
    setShowCompose(true);
  };

  const closeCompose = () => {
    if (pending) return;
    setShowCompose(false);
    setPostError(null);
    revokeDraftPhotos(postPhotos);
    setPostPhotos([]);
  };

  const submitPost = () => {
    if (pending || (postBody.trim().length === 0 && postPhotos.length === 0)) return;
    setPostError(null);

    startTransition(async () => {
      try {
        const formData = await preparePhotoFormData(postBody, postPhotos);
        const result = await createNote(formData);
        if (result.error) {
          setPostError(result.error);
          return;
        }
        revokeDraftPhotos(postPhotos);
        setPostBody("");
        setPostPhotos([]);
        setShowCompose(false);
        router.refresh();
      } catch (error) {
        setPostError(error instanceof Error ? error.message : "画像の処理に失敗しました");
      }
    });
  };

  const startEditPost = (note: NoteWithPhotos) => {
    if (pending || note.author_type !== actor) return;
    revokeDraftPhotos(editPostPhotos);
    setEditingPostId(note.id);
    setEditPostBody(note.body);
    setEditPostPhotos(
      note.photo_paths.map((path, index) =>
        createExistingDraftPhoto(path, note.photoUrls[index] ?? path),
      ),
    );
    setEditPostError(null);
  };

  const cancelEditPost = () => {
    revokeDraftPhotos(editPostPhotos);
    setEditingPostId(null);
    setEditPostBody("");
    setEditPostPhotos([]);
    setEditPostError(null);
  };

  const handleSavePost = () => {
    if (!editingPostId) return;
    setEditPostError(null);

    startTransition(async () => {
      try {
        const formData = await preparePhotoFormData(editPostBody, editPostPhotos);
        const result = await updateNote(editingPostId, formData);
        if (result.error) {
          setEditPostError(result.error);
          return;
        }
        cancelEditPost();
        router.refresh();
      } catch (error) {
        setEditPostError(error instanceof Error ? error.message : "画像の処理に失敗しました");
      }
    });
  };

  const handleDeletePost = (noteId: string) => {
    if (pending) return;
    if (!window.confirm("このNOTEを削除しますか？")) return;
    setEditPostError(null);

    startTransition(async () => {
      const result = await deleteNote(noteId);
      if (result.error) {
        setEditPostError(result.error);
        return;
      }
      cancelEditPost();
      router.refresh();
    });
  };

  const handleReplySubmit = (noteId: string) => {
    const body = replyBodies[noteId] ?? "";
    const photos = replyPhotos[noteId] ?? [];
    setReplyErrors((current) => ({ ...current, [noteId]: null }));

    startTransition(async () => {
      try {
        const formData = await preparePhotoFormData(body, photos);
        const result = await createNoteReply(noteId, formData);
        if (result.error) {
          setReplyErrors((current) => ({ ...current, [noteId]: result.error ?? null }));
          return;
        }
        revokeDraftPhotos(photos);
        setReplyBodies((current) => ({ ...current, [noteId]: "" }));
        setReplyPhotos((current) => ({ ...current, [noteId]: [] }));
        router.refresh();
      } catch (error) {
        setReplyErrors((current) => ({
          ...current,
          [noteId]: error instanceof Error ? error.message : "画像の処理に失敗しました",
        }));
      }
    });
  };

  const startEditReply = (reply: NoteReplyWithPhotos) => {
    if (pending || reply.author_type !== actor) return;
    revokeDraftPhotos(editReplyPhotos);
    setEditingReplyId(reply.id);
    setEditReplyBody(reply.body);
    setEditReplyPhotos(
      reply.photo_paths.map((path, index) =>
        createExistingDraftPhoto(path, reply.photoUrls[index] ?? path),
      ),
    );
    setEditReplyError(null);
  };

  const cancelEditReply = () => {
    revokeDraftPhotos(editReplyPhotos);
    setEditingReplyId(null);
    setEditReplyBody("");
    setEditReplyPhotos([]);
    setEditReplyError(null);
  };

  const handleSaveReply = () => {
    if (!editingReplyId) return;
    setEditReplyError(null);

    startTransition(async () => {
      try {
        const formData = await preparePhotoFormData(editReplyBody, editReplyPhotos);
        const result = await updateNoteReply(editingReplyId, formData);
        if (result.error) {
          setEditReplyError(result.error);
          return;
        }
        cancelEditReply();
        router.refresh();
      } catch (error) {
        setEditReplyError(error instanceof Error ? error.message : "画像の処理に失敗しました");
      }
    });
  };

  const handleDeleteReply = (replyId: string) => {
    if (pending) return;
    if (!window.confirm("この返信を削除しますか？")) return;
    setEditReplyError(null);

    startTransition(async () => {
      const result = await deleteNoteReply(replyId);
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
      {notes.length > 0 ? (
        <ul className="space-y-4 pb-24">
          {notes.map((note) => {
            const replies = repliesByNoteId[note.id] ?? [];
            const isEditingPost = editingPostId === note.id;
            const canEditPost = note.author_type === actor;
            const draftReplyPhotos = replyPhotos[note.id] ?? [];
            const canSubmitReply =
              ((replyBodies[note.id] ?? "").trim().length > 0 || draftReplyPhotos.length > 0) &&
              !pending;

            return (
              <li key={note.id}>
                <article className="rounded-[18px] border border-border bg-card px-4 py-4">
                  {isEditingPost ? (
                    <>
                      <textarea
                        value={editPostBody}
                        onChange={(event) => setEditPostBody(event.target.value)}
                        placeholder="NOTE"
                        disabled={pending}
                        maxLength={NOTE_MAX_LENGTH}
                        rows={3}
                        className="w-full resize-none rounded-2xl border border-border bg-card px-4 py-3.5 text-sm leading-relaxed text-text outline-none placeholder:text-[#c9b0a0] focus:border-accent disabled:opacity-70"
                      />
                      <p className="mt-1 text-right text-[10px] text-text-muted">
                        {editPostBody.length}/{NOTE_MAX_LENGTH}
                      </p>
                      <div className="mt-2">
                        <NotePhotoComposer
                          photos={editPostPhotos}
                          disabled={pending}
                          compact
                          onChange={setEditPostPhotos}
                        />
                      </div>
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
                        onClick={() => handleDeletePost(note.id)}
                        className="mt-3 w-full py-1 text-center text-xs text-text-muted disabled:opacity-70"
                      >
                        削除
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="flex items-start gap-2">
                        <AuthorBadge authorType={note.author_type} />
                        <div className="min-w-0 flex-1">
                          {note.body ? (
                            <p className="whitespace-pre-wrap text-sm leading-relaxed text-text">
                              {note.body}
                            </p>
                          ) : null}
                          <NotePhotoGrid urls={note.photoUrls} />
                          <p className="mt-2 text-[10px] text-text-muted">
                            {formatRelativeTime(note.created_at)}
                          </p>
                        </div>
                        {canEditPost ? (
                          <AuthorMenu
                            disabled={pending}
                            onEdit={() => startEditPost(note)}
                            onDelete={() => handleDeletePost(note.id)}
                          />
                        ) : null}
                      </div>
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
                              <textarea
                                value={editReplyBody}
                                onChange={(event) => setEditReplyBody(event.target.value)}
                                placeholder="返信"
                                disabled={pending}
                                maxLength={NOTE_MAX_LENGTH}
                                rows={3}
                                className="w-full resize-none rounded-2xl border border-border bg-card px-4 py-3.5 text-sm leading-relaxed text-text outline-none placeholder:text-[#c9b0a0] focus:border-accent disabled:opacity-70"
                              />
                              <p className="mt-1 text-right text-[10px] text-text-muted">
                                {editReplyBody.length}/{NOTE_MAX_LENGTH}
                              </p>
                              <div className="mt-2">
                                <NotePhotoComposer
                                  photos={editReplyPhotos}
                                  disabled={pending}
                                  compact
                                  onChange={setEditReplyPhotos}
                                />
                              </div>
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
                                onClick={() => handleDeleteReply(reply.id)}
                                className="mt-3 w-full py-1 text-center text-xs text-text-muted disabled:opacity-70"
                              >
                                削除
                              </button>
                            </li>
                          );
                        }

                        return (
                          <li key={reply.id} className="rounded-2xl bg-[#fffaf7] px-3 py-3">
                            <div className="flex items-start gap-2">
                              <AuthorBadge authorType={reply.author_type} />
                              <div className="min-w-0 flex-1">
                                {reply.body ? (
                                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-text">
                                    {reply.body}
                                  </p>
                                ) : null}
                                <NotePhotoGrid urls={reply.photoUrls} compact />
                                <p className="mt-1.5 text-[10px] text-text-muted">
                                  {formatRelativeTime(reply.created_at)}
                                </p>
                              </div>
                              {canEditReply ? (
                                <AuthorMenu
                                  disabled={pending}
                                  onEdit={() => startEditReply(reply)}
                                  onDelete={() => handleDeleteReply(reply.id)}
                                />
                              ) : null}
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  ) : null}

                  {!isEditingPost ? (
                    <div className="mt-4 flex flex-col gap-2 border-t border-border pt-4">
                      <textarea
                        value={replyBodies[note.id] ?? ""}
                        onChange={(event) =>
                          setReplyBodies((current) => ({
                            ...current,
                            [note.id]: event.target.value,
                          }))
                        }
                        placeholder="返信を書く…"
                        disabled={pending}
                        maxLength={NOTE_MAX_LENGTH}
                        rows={2}
                        className="w-full resize-none rounded-2xl border border-border bg-[#fffaf7] px-4 py-3 text-sm leading-relaxed text-text outline-none placeholder:text-[#c9b0a0] focus:border-accent disabled:opacity-70"
                      />
                      <NotePhotoComposer
                        photos={draftReplyPhotos}
                        disabled={pending}
                        compact
                        onChange={(next) =>
                          setReplyPhotos((current) => ({ ...current, [note.id]: next }))
                        }
                      />
                      {replyErrors[note.id] ? (
                        <p className="text-center text-sm text-accent">{replyErrors[note.id]}</p>
                      ) : null}
                      <button
                        type="button"
                        disabled={!canSubmitReply}
                        onClick={() => handleReplySubmit(note.id)}
                        className="self-end rounded-2xl bg-accent px-5 py-2.5 text-xs tracking-wide text-card disabled:opacity-70"
                      >
                        {pending ? "..." : "返信する"}
                      </button>
                    </div>
                  ) : null}
                </article>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="mb-24 rounded-[18px] border border-border bg-card px-5 py-8 text-center text-sm text-text-sub">
          まだNOTEがありません。
        </p>
      )}

      {!showCompose ? (
        <div className="pointer-events-none fixed inset-x-0 bottom-24 z-40 mx-auto w-full max-w-[390px] px-5">
          <button
            type="button"
            onClick={openCompose}
            aria-label="新しいNOTE"
            className="pointer-events-auto ml-auto flex size-14 items-center justify-center rounded-full bg-accent text-card shadow-[0_4px_16px_rgba(196,106,106,0.35)] transition-transform active:scale-95"
          >
            <i className="ti ti-pencil text-xl" />
          </button>
        </div>
      ) : null}

      <ComposeNoteModal
        open={showCompose}
        body={postBody}
        photos={postPhotos}
        error={postError}
        pending={pending}
        onBodyChange={setPostBody}
        onPhotosChange={setPostPhotos}
        onClose={closeCompose}
        onSubmit={submitPost}
      />
    </>
  );
}
