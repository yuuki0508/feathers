const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"] as const;
const APP_TIMEZONE = "Asia/Tokyo";

/** YYYY-MM-DD（DB の date 型など）をタイムゾーンに依存せず解釈する */
function parseCalendarDate(
  dateStr: string,
): { year: number; month: number; day: number } | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr);
  if (!match) return null;
  return {
    year: Number(match[1]),
    month: Number(match[2]),
    day: Number(match[3]),
  };
}

/** 日本時間の「今日」を YYYY-MM-DD で返す（Vercel UTC サーバーでも正しい日付になる） */
export function getTodayDateString(timeZone = APP_TIMEZONE): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone }).format(new Date());
}

export function formatFullDate(dateStr: string): string {
  const calendar = parseCalendarDate(dateStr);
  if (calendar) {
    return `${calendar.year}年${calendar.month}月${calendar.day}日`;
  }
  const date = new Date(dateStr);
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
}

export function formatDiaryDate(dateStr: string): string {
  const date = new Date(dateStr);
  const weekday = WEEKDAYS[date.getDay()];
  return `${date.getMonth() + 1}月${date.getDate()}日（${weekday}）`;
}

export function formatShortDate(dateStr: string): string {
  const date = new Date(dateStr);
  return `${date.getMonth() + 1}月${date.getDate()}日`;
}

export function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfTarget = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  );
  const diffDays = Math.floor(
    (startOfToday.getTime() - startOfTarget.getTime()) / (1000 * 60 * 60 * 24),
  );
  const time = `${date.getHours()}:${String(date.getMinutes()).padStart(2, "0")}`;

  if (diffDays === 0) return `今日 ${time}`;
  if (diffDays === 1) return `昨日 ${time}`;
  return formatShortDate(dateStr);
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}…`;
}

export function formatLikeNumber(index: number): string {
  return String(index + 1).padStart(2, "0");
}

export function formatFeedDateTime(dateStr: string): string {
  const date = new Date(dateStr);
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${date.getMonth() + 1}月${date.getDate()}日 ${hours}:${minutes}`;
}
