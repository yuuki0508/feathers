import { AccessLogTracker } from "@/components/viewer/access-log-tracker";
import { HomeFeed } from "@/components/viewer/home-feed";
import {
  HomeLikeSpotlight,
  type HomeLikeItem,
} from "@/components/viewer/home-like-spotlight";
import { ServiceHeader } from "@/components/viewer/service-header";
import { buildFeedItems } from "@/lib/feed-items";
import { formatFullDate, formatLikeNumber, getTodayDateString } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import type { Diary, KaraokeSong, Like, Memory, Message, MutteringReply, Novel, TodayMessage, WishlistItem } from "@/lib/types/database";

export default async function HomePage() {
  const supabase = await createClient();

  const [
    { data: todayMessage },
    { data: messages },
    { data: memories },
    { data: likes },
    { data: diaries },
    { data: novels },
    { data: wishlistItems },
    { data: karaokeSongs },
    { data: mutteringReplies },
  ] = await Promise.all([
    supabase
      .from("today_message")
      .select("*")
      .order("display_date", { ascending: false })
      .limit(1)
      .maybeSingle<TodayMessage>(),
    supabase
      .from("messages")
      .select("id, created_at, updated_at, categories(name)")
      .order("created_at", { ascending: false })
      .returns<Pick<Message, "id" | "created_at" | "updated_at" | "categories">[]>(),
    supabase
      .from("memories")
      .select("id, created_at, updated_at, memory_date")
      .order("memory_date", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false })
      .returns<Pick<Memory, "id" | "created_at" | "updated_at" | "memory_date">[]>(),
    supabase
      .from("likes")
      .select("id, body, created_at, updated_at, display_order")
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: true })
      .returns<Pick<Like, "id" | "body" | "created_at" | "updated_at" | "display_order">[]>(),
    supabase
      .from("diaries")
      .select("id, created_at, updated_at, title")
      .order("created_at", { ascending: false })
      .returns<Pick<Diary, "id" | "created_at" | "updated_at" | "title">[]>(),
    supabase
      .from("novels")
      .select("id, created_at, updated_at, title")
      .order("created_at", { ascending: false })
      .returns<Pick<Novel, "id" | "created_at" | "updated_at" | "title">[]>(),
    supabase
      .from("wishlist_items")
      .select("id, created_at, updated_at, body")
      .order("created_at", { ascending: false })
      .returns<Pick<WishlistItem, "id" | "created_at" | "updated_at" | "body">[]>(),
    supabase
      .from("karaoke_songs")
      .select("id, title, status, proposed_by, created_at, updated_at")
      .order("created_at", { ascending: false })
      .returns<
        Pick<KaraokeSong, "id" | "title" | "status" | "proposed_by" | "created_at" | "updated_at">[]
      >(),
    supabase
      .from("muttering_replies")
      .select("id, body, created_at, updated_at")
      .eq("author_type", "admin")
      .order("created_at", { ascending: false })
      .returns<Pick<MutteringReply, "id" | "body" | "created_at" | "updated_at">[]>(),
  ]);

  const feedItems = buildFeedItems({
    messages: messages ?? [],
    memories: memories ?? [],
    likes: likes ?? [],
    diaries: diaries ?? [],
    novels: novels ?? [],
    wishlistItems: wishlistItems ?? [],
    karaokeSongs: karaokeSongs ?? [],
    mutteringReplies: mutteringReplies ?? [],
  });

  const homeLikes: HomeLikeItem[] = (likes ?? []).map((like, index) => ({
    id: like.id,
    body: like.body,
    number: formatLikeNumber(index),
  }));

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

      {homeLikes.length > 0 ? <HomeLikeSpotlight likes={homeLikes} /> : null}

      <HomeFeed items={feedItems} />
    </>
  );
}
