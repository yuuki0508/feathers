import type { AccessLog } from "@/lib/types/database";

export type AnalyticsPeriod = "30days" | "7days" | "thisMonth" | "lastMonth";

export type PageTypeFilter =
  | "all"
  | "手紙"
  | "思い出"
  | "日記"
  | "お楽しみ"
  | "好きなところ"
  | "ホーム";

export function getPeriodRange(period: AnalyticsPeriod): { start: Date; end: Date } {
  const now = new Date();
  const end = new Date(now);
  end.setHours(23, 59, 59, 999);

  if (period === "7days") {
    const start = new Date(now);
    start.setDate(start.getDate() - 6);
    start.setHours(0, 0, 0, 0);
    return { start, end };
  }

  if (period === "thisMonth") {
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    start.setHours(0, 0, 0, 0);
    return { start, end };
  }

  if (period === "lastMonth") {
    const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    start.setHours(0, 0, 0, 0);
    const lastEnd = new Date(now.getFullYear(), now.getMonth(), 0);
    lastEnd.setHours(23, 59, 59, 999);
    return { start, end: lastEnd };
  }

  const start = new Date(now);
  start.setDate(start.getDate() - 29);
  start.setHours(0, 0, 0, 0);
  return { start, end };
}

export function filterLogs(
  logs: AccessLog[],
  period: AnalyticsPeriod,
  pageType: PageTypeFilter,
): AccessLog[] {
  const { start, end } = getPeriodRange(period);

  return logs.filter((log) => {
    const accessedAt = new Date(log.accessed_at);
    const inPeriod = accessedAt >= start && accessedAt <= end;
    const matchesPage =
      pageType === "all" ||
      log.page_type === pageType ||
      (pageType === "手紙" && log.page_type === "手紙一覧") ||
      (pageType === "思い出" && log.page_type === "思い出一覧") ||
      (pageType === "日記" && log.page_type === "日記一覧") ||
      (pageType === "お楽しみ" && log.page_type === "お楽しみ一覧");

    return inPeriod && matchesPage;
  });
}

export function buildHourlyCounts(logs: AccessLog[]): number[] {
  const counts = Array.from({ length: 24 }, () => 0);
  logs.forEach((log) => {
    counts[new Date(log.accessed_at).getHours()] += 1;
  });
  return counts;
}

export function buildContentRanking(logs: AccessLog[]) {
  const counts = new Map<string, { title: string; pageType: string; count: number }>();

  logs.forEach((log) => {
    if (!log.content_id || !log.content_title) return;
    const key = `${log.page_type}:${log.content_id}`;
    const existing = counts.get(key);
    if (existing) {
      existing.count += 1;
    } else {
      counts.set(key, {
        title: log.content_title,
        pageType: log.page_type,
        count: 1,
      });
    }
  });

  return [...counts.values()]
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
}

export function buildDailyLogs(logs: AccessLog[]) {
  const grouped = new Map<string, AccessLog[]>();

  logs.forEach((log) => {
    const dateKey = log.accessed_at.slice(0, 10);
    const existing = grouped.get(dateKey) ?? [];
    existing.push(log);
    grouped.set(dateKey, existing);
  });

  return [...grouped.entries()]
    .sort((a, b) => b[0].localeCompare(a[0]))
    .map(([date, entries]) => ({
      date,
      entries: entries.sort(
        (a, b) => new Date(b.accessed_at).getTime() - new Date(a.accessed_at).getTime(),
      ),
      pageTypes: [...new Set(entries.map((entry) => entry.page_type))],
    }));
}

export async function buildCategoryCounts(
  letterLogs: AccessLog[],
  messageCategories: Map<string, string>,
) {
  const counts = new Map<string, number>();

  letterLogs.forEach((log) => {
    if (!log.content_id) return;
    const categoryName = messageCategories.get(log.content_id) ?? "未分類";
    counts.set(categoryName, (counts.get(categoryName) ?? 0) + 1);
  });

  return [...counts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}

export function formatLogTime(dateStr: string): string {
  const date = new Date(dateStr);
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

export function formatLogDate(dateStr: string): string {
  const date = new Date(dateStr);
  const weekdays = ["日", "月", "火", "水", "木", "金", "土"];
  return `${date.getMonth() + 1}月${date.getDate()}日（${weekdays[date.getDay()]}）`;
}
