import { AccessLogTracker } from "@/components/viewer/access-log-tracker";
import { ListPagination } from "@/components/viewer/list-pagination";
import { ShelfBackLink } from "@/components/viewer/shelf-back-link";
import { SubHeader } from "@/components/viewer/sub-header";
import {
  clampPage,
  getPageRange,
  getTotalPages,
  parsePageParam,
} from "@/lib/pagination";
import { createClient } from "@/lib/supabase/server";
import type { TodayMessage } from "@/lib/types/database";

function formatDisplayDate(dateStr: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr);
  if (match) {
    return `${Number(match[2])}月${Number(match[3])}日`;
  }
  return dateStr;
}

type TodayHistoryPageProps = {
  searchParams: Promise<{ page?: string }>;
};

export default async function TodayHistoryPage({ searchParams }: TodayHistoryPageProps) {
  const params = await searchParams;
  const requestedPage = parsePageParam(params.page);

  const supabase = await createClient();
  const { count } = await supabase
    .from("today_message")
    .select("*", { count: "exact", head: true });

  const totalPages = getTotalPages(count ?? 0);
  const page = clampPage(requestedPage, totalPages);
  const { from, to } = getPageRange(page);

  const { data: messages } = await supabase
    .from("today_message")
    .select("*")
    .order("display_date", { ascending: false })
    .range(from, to)
    .returns<TodayMessage[]>();

  return (
    <>
      <AccessLogTracker pageType="毎日のことば一覧" />
      <ShelfBackLink />
      <SubHeader title="毎日のことば" subtitle="〜轍〜" />
      <div className="px-5">
        {messages && messages.length > 0 ? (
          messages.map((message) => (
            <article
              key={message.id}
              className="mb-3 rounded-[18px] border border-border bg-card p-5"
            >
              <p className="whitespace-pre-wrap text-sm leading-[1.95] text-text">
                {message.body}
              </p>
              <div className="mt-3">
                <span className="text-[10px] text-text-muted">
                  {formatDisplayDate(message.display_date)}
                </span>
              </div>
            </article>
          ))
        ) : (
          <p className="rounded-[18px] border border-border bg-card px-5 py-8 text-center text-sm text-text-sub">
            まだ毎日のことばがありません。
          </p>
        )}
        <ListPagination
          basePath="/shelf/today-history"
          page={page}
          totalPages={totalPages}
        />
      </div>
    </>
  );
}
