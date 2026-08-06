"use client";

import {
  approveKaraokeSong,
  createKaraokeSong,
  deleteKaraokeSong,
  rejectKaraokeSong,
  updateKaraokeSong,
} from "@/lib/actions/karaoke";
import {
  canEditKaraokeSong,
  canRespondToKaraokeSong,
} from "@/lib/karaoke/rules";
import type { KaraokeActor, KaraokeSong, KaraokeStatus } from "@/lib/types/database";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";

type KaraokeContentProps = {
  songs: KaraokeSong[];
  actor: KaraokeActor;
};

type TabKey = "pending" | "approved" | "rejected" | "all";

const TABS: Array<{ key: TabKey; label: string }> = [
  { key: "pending", label: "候補" },
  { key: "approved", label: "採用" },
  { key: "rejected", label: "不採用" },
  { key: "all", label: "すべて" },
];

const STATUS_LABEL: Record<KaraokeStatus, string> = {
  pending: "返事待ち",
  approved: "採用",
  rejected: "不採用",
};

const EMPTY_MESSAGE: Record<TabKey, string> = {
  pending: "候補の曲はまだありません。",
  approved: "採用された曲はまだありません。",
  rejected: "見送った曲はありません。",
  all: "まだ曲がありません。",
};

function filterSongs(songs: KaraokeSong[], tab: TabKey): KaraokeSong[] {
  if (tab === "all") return songs;
  return songs.filter((song) => song.status === tab);
}

function sortSongs(songs: KaraokeSong[]): KaraokeSong[] {
  return [...songs].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );
}

function StatusBadge({ status }: { status: KaraokeStatus }) {
  const styles: Record<KaraokeStatus, string> = {
    pending: "bg-[#fff0e8] text-accent",
    approved: "bg-[#eef6ee] text-[#5a8a5a]",
    rejected: "bg-[#f5f0ee] text-text-muted",
  };

  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] tracking-wide ${styles[status]}`}
    >
      {STATUS_LABEL[status]}
    </span>
  );
}

export function KaraokeContent({ songs, actor }: KaraokeContentProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [tab, setTab] = useState<TabKey>("pending");
  const [addError, setAddError] = useState<string | null>(null);
  const [editError, setEditError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");

  const filteredSongs = useMemo(
    () => sortSongs(filterSongs(songs, tab)),
    [songs, tab],
  );

  const pendingResponseCount = useMemo(
    () =>
      songs.filter(
        (song) =>
          song.status === "pending" && canRespondToKaraokeSong(song.proposed_by, actor),
      ).length,
    [actor, songs],
  );

  const handleAddSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAddError(null);

    const form = event.currentTarget;
    const formData = new FormData(form);

    startTransition(async () => {
      const result = await createKaraokeSong(formData);
      if (result.error) {
        setAddError(result.error);
        return;
      }
      form.reset();
      setTab("pending");
      router.refresh();
    });
  };

  const startEdit = (song: KaraokeSong) => {
    if (pending || !canEditKaraokeSong(song.proposed_by, actor, song.status)) return;
    setEditingId(song.id);
    setEditTitle(song.title);
    setEditError(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditTitle("");
    setEditError(null);
  };

  const handleSaveEdit = () => {
    if (!editingId) return;
    setEditError(null);

    startTransition(async () => {
      const result = await updateKaraokeSong(editingId, editTitle);
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
      const result = await deleteKaraokeSong(editingId);
      if (result.error) {
        setEditError(result.error);
        return;
      }
      cancelEdit();
      router.refresh();
    });
  };

  const handleApprove = (id: string) => {
    if (pending) return;

    startTransition(async () => {
      const result = await approveKaraokeSong(id);
      if (result.error) return;
      setTab("approved");
      router.refresh();
    });
  };

  const handleReject = (id: string) => {
    if (pending) return;

    startTransition(async () => {
      const result = await rejectKaraokeSong(id);
      if (result.error) return;
      setTab("rejected");
      router.refresh();
    });
  };

  return (
    <>
      <div className="mb-4 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {TABS.map(({ key, label }) => {
          const count =
            key === "all"
              ? songs.length
              : songs.filter((song) => song.status === key).length;
          const showBadge = key === "pending" && pendingResponseCount > 0;

          return (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              className={`relative shrink-0 rounded-full px-4 py-2 text-xs tracking-wide transition-colors ${
                tab === key
                  ? "bg-accent text-card"
                  : "border border-border bg-card text-text-sub"
              }`}
            >
              {label}
              <span className="ml-1 opacity-80">{count}</span>
              {showBadge ? (
                <span className="absolute -right-0.5 -top-0.5 size-2 rounded-full bg-accent ring-2 ring-cream" />
              ) : null}
            </button>
          );
        })}
      </div>

      {filteredSongs.length > 0 ? (
        <ul className="mb-8 space-y-2.5">
          {filteredSongs.map((song) => {
            const isEditing = editingId === song.id;
            const isPending = song.status === "pending";
            const showRespond =
              isPending && canRespondToKaraokeSong(song.proposed_by, actor);
            const showWaiting =
              isPending && !canRespondToKaraokeSong(song.proposed_by, actor);
            const editable =
              canEditKaraokeSong(song.proposed_by, actor, song.status);

            if (isEditing) {
              return (
                <li key={song.id}>
                  <div className="rounded-[18px] border border-border bg-card px-4 py-4">
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(event) => setEditTitle(event.target.value)}
                      placeholder="曲名"
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
              <li key={song.id}>
                <div
                  className={`rounded-[18px] border border-border bg-card px-4 py-4 ${
                    song.status === "rejected" ? "opacity-60" : ""
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <p
                      className={`min-w-0 flex-1 text-sm leading-snug ${
                        song.status === "rejected"
                          ? "text-text-muted line-through"
                          : "text-text"
                      }`}
                    >
                      {song.title}
                    </p>
                    {editable ? (
                      <button
                        type="button"
                        disabled={pending}
                        onClick={() => startEdit(song)}
                        aria-label="編集"
                        className="shrink-0 px-1 py-1 text-text-muted disabled:cursor-wait"
                      >
                        <i className="ti ti-pencil text-base" />
                      </button>
                    ) : null}
                  </div>

                  <div className="mt-3">
                    <StatusBadge status={song.status} />
                  </div>

                  {showRespond ? (
                    <div className="mt-3 flex gap-2">
                      <button
                        type="button"
                        disabled={pending}
                        onClick={() => handleApprove(song.id)}
                        className="flex-1 rounded-2xl bg-accent py-3 text-sm tracking-wide text-card disabled:opacity-70"
                      >
                        採用する
                      </button>
                      <button
                        type="button"
                        disabled={pending}
                        onClick={() => handleReject(song.id)}
                        className="flex-1 rounded-2xl border border-border bg-card py-3 text-sm text-text-sub disabled:opacity-70"
                      >
                        見送る
                      </button>
                    </div>
                  ) : null}

                  {showWaiting ? (
                    <p className="mt-3 text-center text-xs text-text-muted">
                      相手の返事待ち…
                    </p>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="mb-8 rounded-[18px] border border-border bg-card px-5 py-8 text-center text-sm text-text-sub">
          {EMPTY_MESSAGE[tab]}
        </p>
      )}

      <form onSubmit={handleAddSubmit} className="flex flex-col gap-2.5">
        <input
          name="title"
          type="text"
          placeholder="曲名"
          disabled={pending}
          className="w-full rounded-2xl border border-border bg-card px-4 py-3.5 text-sm text-text outline-none placeholder:text-[#c9b0a0] focus:border-accent disabled:opacity-70"
        />
        {addError ? <p className="text-center text-sm text-accent">{addError}</p> : null}
        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-2xl bg-accent py-3.5 text-sm tracking-wide text-card disabled:opacity-70"
        >
          {pending ? "..." : "候補として追加する"}
        </button>
      </form>
    </>
  );
}
