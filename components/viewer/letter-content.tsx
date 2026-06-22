"use client";

import { useMemo, useState } from "react";
import { NewBadge } from "@/components/viewer/new-badge";
import { recordAccessLog } from "@/lib/actions/access-log";
import { formatShortDate, truncateText } from "@/lib/format";
import { isMessageRead, markMessageRead } from "@/lib/read-status";
import type { Category, Message } from "@/lib/types/database";

type LetterContentProps = {
  categories: Category[];
  messages: Message[];
};

export function LetterContent({ categories, messages }: LetterContentProps) {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [, setReadVersion] = useState(0);

  const filteredMessages = useMemo(() => {
    if (!selectedCategoryId) return messages;
    return messages.filter((message) => message.category_id === selectedCategoryId);
  }, [messages, selectedCategoryId]);

  const handleToggle = (message: Message) => {
    const nextId = expandedId === message.id ? null : message.id;
    setExpandedId(nextId);

    if (nextId) {
      markMessageRead(message.id);
      setReadVersion((version) => version + 1);
      void recordAccessLog({
        pageType: "手紙",
        contentId: message.id,
        contentTitle: truncateText(message.body, 30),
      });
    }
  };

  return (
    <>
      <div className="scrollbar-none mb-4 flex gap-2 overflow-x-auto px-5 pb-1">
        <button
          type="button"
          onClick={() => setSelectedCategoryId(null)}
          className={`shrink-0 rounded-[20px] border px-4 py-1.5 text-xs ${
            selectedCategoryId === null
              ? "border-accent bg-accent text-card"
              : "border-border bg-card text-[#7a6055]"
          }`}
        >
          すべて
        </button>
        {categories.map((category) => (
          <button
            key={category.id}
            type="button"
            onClick={() => setSelectedCategoryId(category.id)}
            className={`shrink-0 rounded-[20px] border px-4 py-1.5 text-xs ${
              selectedCategoryId === category.id
                ? "border-accent bg-accent text-card"
                : "border-border bg-card text-[#7a6055]"
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>

      <div className="px-5">
        {filteredMessages.length > 0 ? (
          filteredMessages.map((message) => {
            const expanded = expandedId === message.id;

            return (
              <button
                key={message.id}
                type="button"
                onClick={() => handleToggle(message)}
                className="mb-3 w-full rounded-[18px] border border-border bg-card p-5 text-left"
              >
                <div className="mb-3 flex items-center gap-2">
                  {message.categories?.name ? (
                    <span className="inline-block rounded-[20px] bg-tag-bg px-2.5 py-0.5 text-[10px] text-accent">
                      {message.categories.name}
                    </span>
                  ) : null}
                  {!isMessageRead(message.id) ? <NewBadge className="mb-0" /> : null}
                </div>
                <p
                  className={`whitespace-pre-wrap text-sm leading-[1.95] text-text ${
                    expanded ? "" : "line-clamp-3"
                  }`}
                >
                  {message.body}
                </p>
                <div className="mt-3">
                  <span className="text-[10px] text-text-muted">
                    {formatShortDate(message.created_at)}
                  </span>
                </div>
              </button>
            );
          })
        ) : (
          <p className="rounded-[18px] border border-border bg-card px-5 py-8 text-center text-sm text-text-sub">
            このカテゴリにはまだ手紙がありません。
          </p>
        )}
      </div>
    </>
  );
}
