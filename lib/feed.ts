import { getCalendarDaysSince } from "@/lib/format";

export type FeedContentType =
  | "messages"
  | "memories"
  | "likes"
  | "diaries"
  | "novels"
  | "wishlist_items";

export type FeedItem = {
  id: string;
  contentType: FeedContentType;
  label: string;
  detail?: string;
  /** 思い出・お楽しみのコンテンツ日付（YYYY-MM-DD, JST） */
  contentDate?: string;
  action: "added" | "updated";
  occurredAt: string;
  href: string;
};

export function buildFeedText(item: FeedItem): string {
  const verb = item.action === "updated" ? "更新" : "追加";

  switch (item.contentType) {
    case "diaries":
    case "novels":
    case "wishlist_items":
      return item.detail
        ? `${item.label}「${item.detail}」が${verb}されました。`
        : `${item.label}が${verb}されました。`;
    case "messages":
      return item.detail
        ? `${item.label}（${item.detail}）が${verb}されました。`
        : `${item.label}が${verb}されました。`;
    case "likes":
      return item.detail
        ? `${item.label} #${item.detail} が${verb}されました。`
        : `${item.label}が${verb}されました。`;
    default:
      return `${item.label}が${verb}されました。`;
  }
}

export function shouldShowFeedItem(item: FeedItem, isRead: boolean): boolean {
  const daysSince = getCalendarDaysSince(item.occurredAt);

  if (daysSince >= 3) return false;
  if (isRead && daysSince >= 1) return false;

  return true;
}
