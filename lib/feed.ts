import { getTodayDateString, toDateInputValue } from "@/lib/format";

export type FeedContentType = "messages" | "memories" | "likes" | "diaries" | "novels";

export type FeedItem = {
  id: string;
  contentType: FeedContentType;
  label: string;
  action: "added" | "updated";
  occurredAt: string;
  href: string;
};

export function buildFeedText(item: FeedItem): string {
  const verb = item.action === "updated" ? "更新" : "追加";
  return `${item.label}が${verb}されました。`;
}

export function isFeedItemFromPastDay(occurredAt: string): boolean {
  const today = getTodayDateString();
  const occurredDate = toDateInputValue(occurredAt);
  return occurredDate < today;
}

export function shouldShowFeedItem(occurredAt: string, isRead: boolean): boolean {
  if (!isFeedItemFromPastDay(occurredAt)) return true;
  return !isRead;
}
