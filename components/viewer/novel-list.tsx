"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { NewBadge } from "@/components/viewer/new-badge";
import { getNovelContentDate, isTreatableAsNew } from "@/lib/content-sort";
import { formatShortDate, getTodayDateString, truncateText } from "@/lib/format";
import { isNovelRead } from "@/lib/read-status";
import type { Novel } from "@/lib/types/database";

export function NovelList({ novels }: { novels: Novel[] }) {
  const pathname = usePathname();
  const [, setReadVersion] = useState(0);
  const today = getTodayDateString();

  useEffect(() => {
    setReadVersion((version) => version + 1);
  }, [pathname]);
  if (novels.length === 0) {
    return (
      <p className="rounded-[18px] border border-border bg-card px-5 py-8 text-center text-sm text-text-sub">
        まだ作品がありません。
      </p>
    );
  }

  return (
    <>
      {novels.map((novel) => (
        <Link
          key={novel.id}
          href={`/novel/${novel.id}`}
          className="mb-3 block rounded-[18px] border border-border bg-card p-5"
        >
          {!isNovelRead(novel.id) && isTreatableAsNew(getNovelContentDate(novel), today) ? (
            <NewBadge />
          ) : null}
          <h2 className="mb-2 text-base font-medium leading-snug text-text">
            {novel.title}
          </h2>
          <p className="line-clamp-3 text-[13px] leading-[1.8] text-[#8a7060]">
            {truncateText(novel.body, 100)}
          </p>
          <div className="mt-3.5 flex items-center justify-between">
            <span className="text-[10px] text-text-muted">
              {formatShortDate(novel.created_at)}
            </span>
            <span className="text-[11px] tracking-wide text-accent">続きを読む →</span>
          </div>
        </Link>
      ))}
    </>
  );
}
