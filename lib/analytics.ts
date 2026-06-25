import type { AccessLog } from "@/lib/types/database";
import {
  formatCalendarDateWithWeekday,
  formatTimeInTimezone,
  getHourInTimezone,
  getTodayDateString,
  subtractCalendarDays,
  toDateInputValue,
} from "@/lib/format";

const APP_TIMEZONE = "Asia/Tokyo";
const JST_OFFSET = "+09:00";

export type AnalyticsPeriod = "30days" | "7days" | "thisMonth" | "lastMonth";

export type PageTypeFilter =
  | "all"
  | "手紙"
  | "思い出"
  | "日記"
  | "お楽しみ"
  | "好きなところ"
  | "ホーム";

function jstDayStart(dateStr: string): Date {
  return new Date(`${dateStr}T00:00:00${JST_OFFSET}`);
}

function jstDayEnd(dateStr: string): Date {
  return new Date(`${dateStr}T23:59:59.999${JST_OFFSET}`);
}

export function getPeriodRange(
  period: AnalyticsPeriod,
  timeZone = APP_TIMEZONE,
): { start: Date; end: Date } {
  const today = getTodayDateString(timeZone);
  const end = jstDayEnd(today);

  if (period === "7days") {
    return { start: jstDayStart(subtractCalendarDays(today, 6)), end };
  }

  if (period === "thisMonth") {
    const monthStart = `${today.slice(0, 7)}-01`;
    return { start: jstDayStart(monthStart), end };
  }

  if (period === "lastMonth") {
    const lastDayOfPrevMonth = subtractCalendarDays(`${today.slice(0, 7)}-01`, 1);
    const monthStart = `${lastDayOfPrevMonth.slice(0, 7)}-01`;
    return { start: jstDayStart(monthStart), end: jstDayEnd(lastDayOfPrevMonth) };
  }

  return { start: jstDayStart(subtractCalendarDays(today, 29)), end };
}

/** 日本時間の今月1日 0:00 〜 今日 23:59 */
export function getThisMonthRange(timeZone = APP_TIMEZONE): { start: Date; end: Date } {
  const today = getTodayDateString(timeZone);
  const monthStart = `${today.slice(0, 7)}-01`;
  return {
    start: jstDayStart(monthStart),
    end: jstDayEnd(today),
  };
}

/** 日本時間の「今日」の 0:00〜23:59 */
export function getTodayRange(timeZone = APP_TIMEZONE): { start: Date; end: Date } {
  const today = getTodayDateString(timeZone);
  return {
    start: jstDayStart(today),
    end: jstDayEnd(today),
  };
}

export function countLogsInRange(logs: AccessLog[], start: Date, end: Date): number {
  return logs.filter((log) => {
    const accessedAt = new Date(log.accessed_at);
    return accessedAt >= start && accessedAt <= end;
  }).length;
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

export function buildHourlyCounts(logs: AccessLog[], timeZone = APP_TIMEZONE): number[] {
  const counts = Array.from({ length: 24 }, () => 0);
  logs.forEach((log) => {
    counts[getHourInTimezone(log.accessed_at, timeZone)] += 1;
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

export function buildDailyLogs(logs: AccessLog[], timeZone = APP_TIMEZONE) {
  const grouped = new Map<string, AccessLog[]>();

  logs.forEach((log) => {
    const dateKey = toDateInputValue(log.accessed_at, timeZone);
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

export function formatLogTime(dateStr: string, timeZone = APP_TIMEZONE): string {
  return formatTimeInTimezone(dateStr, timeZone);
}

export function formatLogDate(dateStr: string): string {
  return formatCalendarDateWithWeekday(dateStr);
}
