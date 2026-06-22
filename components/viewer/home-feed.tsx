"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { buildFeedText, shouldShowFeedItem, type FeedItem } from "@/lib/feed";
import { formatFeedDateTime } from "@/lib/format";
import { isContentRead, markLikeRead } from "@/lib/read-status";

type HomeFeedProps = {
  items: FeedItem[];
};

export function HomeFeed({ items }: HomeFeedProps) {
  const pathname = usePathname();
  const [readVersion, setReadVersion] = useState(0);

  useEffect(() => {
    setReadVersion((version) => version + 1);
  }, [pathname]);

  const visibleItems = useMemo(
    () =>
      items.filter((item) =>
        shouldShowFeedItem(item.occurredAt, isContentRead(item.contentType, item.id)),
      ),
    [items, readVersion],
  );

  const handleClick = (item: FeedItem) => {
    if (item.contentType === "likes") {
      markLikeRead(item.id);
      setReadVersion((version) => version + 1);
    }
  };

  return (
    <section className="mb-6 px-5">
      <p className="mb-2.5 pl-0.5 text-[10px] tracking-[0.14em] text-text-sub">
        新着情報
      </p>
      {visibleItems.length > 0 ? (
        visibleItems.map((item) => (
          <Link
            key={`${item.contentType}-${item.id}`}
            href={item.href}
            onClick={() => handleClick(item)}
            className="relative mb-2.5 block overflow-hidden rounded-[18px] border border-border bg-card px-[18px] py-[18px] pb-3.5"
          >
            <span className="absolute left-0 top-0 h-full w-1 rounded-l-[18px] bg-accent-light" />
            <p className="pl-1.5 text-sm leading-[1.9] text-text">{buildFeedText(item)}</p>
            <p className="mt-2.5 pl-1.5 text-[10px] text-text-muted">
              {formatFeedDateTime(item.occurredAt)}
            </p>
          </Link>
        ))
      ) : (
        <p className="rounded-[18px] border border-border bg-card px-5 py-8 text-center text-sm text-text-sub">
          新着情報はありません。
        </p>
      )}
    </section>
  );
}
