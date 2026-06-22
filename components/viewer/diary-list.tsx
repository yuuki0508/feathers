"use client";

import { useState } from "react";
import { NewBadge } from "@/components/viewer/new-badge";
import { recordAccessLog } from "@/lib/actions/access-log";
import { formatDiaryDate } from "@/lib/format";
import { isDiaryRead, markDiaryRead } from "@/lib/read-status";
import type { Diary } from "@/lib/types/database";

export function DiaryList({ diaries }: { diaries: Diary[] }) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [, setReadVersion] = useState(0);

  const handleToggle = (diary: Diary) => {
    const nextId = expandedId === diary.id ? null : diary.id;
    setExpandedId(nextId);

    if (nextId) {
      markDiaryRead(diary.id);
      setReadVersion((version) => version + 1);
      void recordAccessLog({
        pageType: "日記",
        contentId: diary.id,
        contentTitle: diary.title,
      });
    }
  };

  if (diaries.length === 0) {
    return (
      <p className="rounded-[18px] border border-border bg-card px-5 py-8 text-center text-sm text-text-sub">
        まだ日記がありません。
      </p>
    );
  }

  return (
    <>
      {diaries.map((diary) => {
        const expanded = expandedId === diary.id;

        return (
          <button
            key={diary.id}
            type="button"
            onClick={() => handleToggle(diary)}
            className="mb-3 w-full rounded-[18px] border border-border bg-card p-5 text-left"
          >
            <div className="mb-2.5 flex items-center gap-2">
              <p className="text-[10px] tracking-wide text-accent">
                {formatDiaryDate(diary.diary_date)}
              </p>
              {!isDiaryRead(diary.id) ? <NewBadge className="mb-0" /> : null}
            </div>
            <h2 className="mb-2 text-[15px] font-medium text-text">{diary.title}</h2>
            <p
              className={`whitespace-pre-wrap text-[13px] leading-[1.9] text-text-body ${
                expanded ? "" : "line-clamp-3"
              }`}
            >
              {diary.body}
            </p>
          </button>
        );
      })}
    </>
  );
}
