import { AccessLogTracker } from "@/components/viewer/access-log-tracker";
import { ShelfBackLink } from "@/components/viewer/shelf-back-link";
import { SubHeader } from "@/components/viewer/sub-header";
import { createClient } from "@/lib/supabase/server";
import type { TodayMessage } from "@/lib/types/database";

function formatDisplayDate(dateStr: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr);
  if (match) {
    return `${Number(match[2])}月${Number(match[3])}日`;
  }
  return dateStr;
}

export default async function TodayHistoryPage() {
  const supabase = await createClient();
  const { data: messages } = await supabase
    .from("today_message")
    .select("*")
    .order("display_date", { ascending: false })
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
      </div>
    </>
  );
}
