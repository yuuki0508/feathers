import type { FeedItem } from "@/lib/feed";
import { getMemorySortAt, getNovelSortAt } from "@/lib/content-sort";
import { formatLikeNumber } from "@/lib/format";

type FeedRecord = {
  id: string;
  created_at: string;
  updated_at: string;
};

type MessageFeedRecord = FeedRecord & {
  categories: { name: string } | null;
};

type MemoryFeedRecord = FeedRecord & {
  memory_date: string | null;
};

type DiaryFeedRecord = FeedRecord & {
  title: string;
};

type NovelFeedRecord = FeedRecord & {
  title: string;
};

type LikeFeedRecord = FeedRecord & {
  display_order: number;
};

type FeedSourceData = {
  messages: MessageFeedRecord[];
  memories: MemoryFeedRecord[];
  likes: LikeFeedRecord[];
  diaries: DiaryFeedRecord[];
  novels: NovelFeedRecord[];
};

type FeedItemWithSort = FeedItem & {
  sortAt: string;
};

function resolveFeedEvent(record: FeedRecord): Pick<FeedItem, "action" | "occurredAt"> {
  const createdAt = new Date(record.created_at).getTime();
  const updatedAt = new Date(record.updated_at).getTime();

  if (updatedAt - createdAt > 1000) {
    return { action: "updated", occurredAt: record.updated_at };
  }

  return { action: "added", occurredAt: record.created_at };
}

function buildLikeNumberMap(likes: LikeFeedRecord[]): Map<string, string> {
  const sorted = [...likes].sort((a, b) => {
    if (a.display_order !== b.display_order) {
      return a.display_order - b.display_order;
    }
    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
  });

  return new Map(sorted.map((like, index) => [like.id, formatLikeNumber(index)]));
}

export function buildFeedItems(data: FeedSourceData): FeedItem[] {
  const likeNumbers = buildLikeNumberMap(data.likes);

  const items: FeedItemWithSort[] = [
    ...data.messages.map((item) => {
      const event = resolveFeedEvent(item);
      return {
        id: item.id,
        contentType: "messages" as const,
        label: "手紙",
        detail: item.categories?.name,
        href: "/letter",
        sortAt: event.occurredAt,
        ...event,
      };
    }),
    ...data.memories.map((item) => {
      const event = resolveFeedEvent(item);
      return {
        id: item.id,
        contentType: "memories" as const,
        label: "思い出",
        href: "/shelf/memory",
        sortAt: getMemorySortAt(item),
        ...event,
      };
    }),
    ...data.likes.map((item) => {
      const event = resolveFeedEvent(item);
      return {
        id: item.id,
        contentType: "likes" as const,
        label: "好きなところ",
        detail: likeNumbers.get(item.id),
        href: "/shelf/likes",
        sortAt: event.occurredAt,
        ...event,
      };
    }),
    ...data.diaries.map((item) => {
      const event = resolveFeedEvent(item);
      return {
        id: item.id,
        contentType: "diaries" as const,
        label: "日記",
        detail: item.title,
        href: "/shelf/diary",
        sortAt: event.occurredAt,
        ...event,
      };
    }),
    ...data.novels.map((item) => {
      const event = resolveFeedEvent(item);
      return {
        id: item.id,
        contentType: "novels" as const,
        label: "お楽しみ",
        detail: item.title,
        href: `/novel/${item.id}`,
        sortAt: getNovelSortAt(item),
        ...event,
      };
    }),
  ];

  return items
    .sort((a, b) => new Date(b.sortAt).getTime() - new Date(a.sortAt).getTime())
    .map(({ sortAt: _sortAt, ...item }) => item);
}
