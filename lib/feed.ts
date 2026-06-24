import { getCalendarDaysSince } from "@/lib/format";

export type FeedContentType = "messages" | "memories" | "likes" | "diaries" | "novels";

export type FeedItem = {
  id: string;
  contentType: FeedContentType;
  label: string;
  detail?: string;
  action: "added" | "updated";
  occurredAt: string;
  href: string;
};

export function buildFeedText(item: FeedItem): string {
  const verb = item.action === "updated" ? "更新" : "追加";

  switch (item.contentType) {
    case "diaries":
    case "novels":
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

export function shouldShowFeedItem(occurredAt: string, isRead: boolean): boolean {
  const daysSince = getCalendarDaysSince(occurredAt);

  if (daysSince >= 3) return false;
  if (isRead && daysSince >= 1) return false;

  return true;
}
