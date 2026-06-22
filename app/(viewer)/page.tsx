import { AccessLogTracker } from "@/components/viewer/access-log-tracker";
import { HomeFeed } from "@/components/viewer/home-feed";
import { ServiceHeader } from "@/components/viewer/service-header";
import { buildFeedItems } from "@/lib/feed-items";
import { formatFullDate, getTodayDateString } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import type { TodayMessage } from "@/lib/types/database";

export default async function HomePage() {
  const supabase = await createClient();

  const [
    { data: todayMessage },
    { data: messages },
    { data: memories },
    { data: likes },
    { data: diaries },
    { data: novels },
  ] = await Promise.all([
    supabase
      .from("today_message")
      .select("*")
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle<TodayMessage>(),
    supabase.from("messages").select("id, created_at, updated_at").order("created_at", { ascending: false }),
    supabase.from("memories").select("id, created_at, updated_at").order("created_at", { ascending: false }),
    supabase.from("likes").select("id, created_at, updated_at").order("created_at", { ascending: false }),
    supabase.from("diaries").select("id, created_at, updated_at").order("created_at", { ascending: false }),
    supabase.from("novels").select("id, created_at, updated_at").order("created_at", { ascending: false }),
  ]);

  const feedItems = buildFeedItems({
    messages: messages ?? [],
    memories: memories ?? [],
    likes: likes ?? [],
    diaries: diaries ?? [],
    novels: novels ?? [],
  });

  return (
    <>
      <AccessLogTracker pageType="ホーム" />
      <ServiceHeader />

      <section className="mb-6 px-5">
        <p className="mb-2.5 pl-0.5 text-[10px] tracking-[0.14em] text-text-sub">
          TODAY
        </p>
        <div className="rounded-[20px] border border-border bg-card px-6 py-5 text-center">
          <p className="mb-2.5 text-[11px] tracking-wide text-text-muted">
            {todayMessage?.display_date
              ? formatFullDate(todayMessage.display_date)
              : formatFullDate(getTodayDateString())}
          </p>
          <p className="whitespace-pre-wrap text-base leading-8 text-text">
            {todayMessage?.body ?? "今日のメッセージはまだありません。"}
          </p>
        </div>
      </section>

      <HomeFeed items={feedItems} />
    </>
  );
}
