import type { FeedItem } from "@/lib/feed";

type FeedRecord = {
  id: string;
  created_at: string;
  updated_at: string;
};

type FeedSourceData = {
  messages: FeedRecord[];
  memories: FeedRecord[];
  likes: FeedRecord[];
  diaries: FeedRecord[];
  novels: FeedRecord[];
};

function resolveFeedEvent(record: FeedRecord): Pick<FeedItem, "action" | "occurredAt"> {
  const createdAt = new Date(record.created_at).getTime();
  const updatedAt = new Date(record.updated_at).getTime();

  if (updatedAt - createdAt > 1000) {
    return { action: "updated", occurredAt: record.updated_at };
  }

  return { action: "added", occurredAt: record.created_at };
}

export function buildFeedItems(data: FeedSourceData): FeedItem[] {
  const items: FeedItem[] = [
    ...data.messages.map((item) => ({
      id: item.id,
      contentType: "messages" as const,
      label: "手紙",
      href: "/letter",
      ...resolveFeedEvent(item),
    })),
    ...data.memories.map((item) => ({
      id: item.id,
      contentType: "memories" as const,
      label: "思い出",
      href: "/shelf/memory",
      ...resolveFeedEvent(item),
    })),
    ...data.likes.map((item) => ({
      id: item.id,
      contentType: "likes" as const,
      label: "好きなところ",
      href: "/shelf/likes",
      ...resolveFeedEvent(item),
    })),
    ...data.diaries.map((item) => ({
      id: item.id,
      contentType: "diaries" as const,
      label: "日記",
      href: "/shelf/diary",
      ...resolveFeedEvent(item),
    })),
    ...data.novels.map((item) => ({
      id: item.id,
      contentType: "novels" as const,
      label: "お楽しみ",
      href: `/novel/${item.id}`,
      ...resolveFeedEvent(item),
    })),
  ];

  return items.sort(
    (a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime(),
  );
}
