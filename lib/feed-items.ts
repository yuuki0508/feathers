import type { FeedItem } from "@/lib/feed";
import { getMemoryContentDate, getNovelContentDate } from "@/lib/content-sort";
import { formatLikeNumber, truncateText } from "@/lib/format";

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

type WishlistFeedRecord = FeedRecord & {
  body: string;
};

type KaraokeFeedRecord = FeedRecord & {
  title: string;
  status: "pending" | "approved" | "rejected";
  proposed_by: "admin" | "viewer";
};

type MutteringReplyFeedRecord = FeedRecord & {
  body: string;
};

type FeedSourceData = {
  messages: MessageFeedRecord[];
  memories: MemoryFeedRecord[];
  likes: LikeFeedRecord[];
  diaries: DiaryFeedRecord[];
  novels: NovelFeedRecord[];
  wishlistItems: WishlistFeedRecord[];
  karaokeSongs: KaraokeFeedRecord[];
  mutteringReplies: MutteringReplyFeedRecord[];
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

function wasUpdatedAfterCreate(record: FeedRecord): boolean {
  return new Date(record.updated_at).getTime() - new Date(record.created_at).getTime() > 1000;
}

function buildKaraokeFeedItems(songs: KaraokeFeedRecord[]): FeedItemWithSort[] {
  const items: FeedItemWithSort[] = [];

  for (const song of songs) {
    if (song.proposed_by === "admin") {
      items.push({
        id: `${song.id}:added`,
        contentType: "karaoke_songs",
        label: "カラオケ",
        detail: truncateText(song.title, 30),
        href: "/shelf/karaoke",
        action: "added",
        occurredAt: song.created_at,
        sortAt: song.created_at,
      });
    }

    if (song.status === "approved" && wasUpdatedAfterCreate(song)) {
      items.push({
        id: `${song.id}:approved`,
        contentType: "karaoke_songs",
        label: "カラオケ",
        detail: truncateText(song.title, 30),
        href: "/shelf/karaoke",
        action: "approved",
        occurredAt: song.updated_at,
        sortAt: song.updated_at,
      });
    }

    if (song.status === "rejected" && wasUpdatedAfterCreate(song)) {
      items.push({
        id: `${song.id}:rejected`,
        contentType: "karaoke_songs",
        label: "カラオケ",
        detail: truncateText(song.title, 30),
        href: "/shelf/karaoke",
        action: "rejected",
        occurredAt: song.updated_at,
        sortAt: song.updated_at,
      });
    }
  }

  return items;
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
        contentDate: getMemoryContentDate(item),
        href: "/shelf/memory",
        sortAt: event.occurredAt,
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
        contentDate: getNovelContentDate(item),
        href: `/novel/${item.id}`,
        sortAt: event.occurredAt,
        ...event,
      };
    }),
    ...data.wishlistItems.map((item) => ({
      id: item.id,
      contentType: "wishlist_items" as const,
      label: "やりたいこと",
      detail: truncateText(item.body, 30),
      href: "/shelf/wishlist",
      action: "added" as const,
      occurredAt: item.created_at,
      sortAt: item.created_at,
    })),
    ...buildKaraokeFeedItems(data.karaokeSongs),
    ...data.mutteringReplies.map((item) => ({
      id: item.id,
      contentType: "muttering_replies" as const,
      label: "メス犬のつぶやき",
      detail: truncateText(item.body, 30),
      href: "/shelf/mutterings",
      action: "added" as const,
      occurredAt: item.created_at,
      sortAt: item.created_at,
    })),
  ];

  return items
    .sort((a, b) => new Date(b.sortAt).getTime() - new Date(a.sortAt).getTime())
    .map(({ sortAt: _sortAt, ...item }) => item);
}
