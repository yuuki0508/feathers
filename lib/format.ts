const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"] as const;

export function formatFullDate(dateStr: string): string {
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
