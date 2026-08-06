import { getCalendarDaysSince } from "@/lib/format";

export type FeedContentType =
  | "messages"
  | "memories"
  | "likes"
  | "diaries"
  | "novels"
  | "wishlist_items"
  | "karaoke_songs"
  | "muttering_replies";

export type FeedItem = {
  id: string;
  contentType: FeedContentType;
  label: string;
  detail?: string;
  /** 思い出・お楽しみのコンテンツ日付（YYYY-MM-DD, JST） */
  contentDate?: string;
  action: "added" | "updated" | "approved" | "rejected";
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
    case "karaoke_songs":
      if (item.action === "approved") {
        return item.detail
          ? `カラオケ「${item.detail}」が採用されました。`
          : "カラオケ曲が採用されました。";
      }
      if (item.action === "rejected") {
        return item.detail
          ? `カラオケ「${item.detail}」が見送られました。`
          : "カラオケ曲が見送られました。";
      }
      return item.detail
        ? `カラオケ「${item.detail}」が候補として追加されました。`
        : "カラオケ曲が候補として追加されました。";
    case "muttering_replies":
      return item.detail
        ? `${item.label}に返信がありました。「${item.detail}」`
        : `${item.label}に返信がありました。`;
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
