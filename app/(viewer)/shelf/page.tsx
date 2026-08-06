import Link from "next/link";
import { SubHeader } from "@/components/viewer/sub-header";
import { createClient } from "@/lib/supabase/server";

export default async function ShelfPage() {
  const supabase = await createClient();

  const [
    { count: memoryCount },
    { count: likesCount },
    { count: diaryCount },
    { count: todayMessageCount },
    { count: wishlistCount },
    { count: karaokeCount },
  ] = await Promise.all([
    supabase.from("memories").select("*", { count: "exact", head: true }),
    supabase.from("likes").select("*", { count: "exact", head: true }),
    supabase.from("diaries").select("*", { count: "exact", head: true }),
    supabase.from("today_message").select("*", { count: "exact", head: true }),
    supabase.from("wishlist_items").select("*", { count: "exact", head: true }),
    supabase.from("karaoke_songs").select("*", { count: "exact", head: true }),
  ]);

  const items = [
    {
      href: "/shelf/memory",
      icon: "ti-photo-heart",
      label: "思い出",
      count: `${memoryCount ?? 0}枚`,
    },
    {
      href: "/shelf/likes",
      icon: "ti-heart",
      label: "好きなところ",
      count: `${likesCount ?? 0}個`,
    },
    {
      href: "/shelf/diary",
      icon: "ti-notebook",
      label: "日記",
      count: `${diaryCount ?? 0}件`,
    },
    {
      href: "/shelf/today-history",
      icon: "ti-calendar-heart",
      label: "毎日のことば",
      count: `${todayMessageCount ?? 0}日`,
    },
    {
      href: "/shelf/wishlist",
      icon: "ti-list-check",
      label: "やりたいこと",
      count: `${wishlistCount ?? 0}件`,
    },
    {
      href: "/shelf/karaoke",
      icon: "ti-microphone-2",
      label: "カラオケ",
      count: `${karaokeCount ?? 0}曲`,
    },
  ] as const;

  return (
    <>
      <SubHeader title="本棚" subtitle="時の足音" />
      <div className="mt-2 grid grid-cols-3 gap-3 px-5">
        {items.map(({ href, icon, label, count }) => (
          <Link
            key={href}
            href={href}
            className="rounded-[18px] border border-border bg-card px-3 py-5 text-center"
          >
            <i className={`ti ${icon} mb-2.5 block text-[28px] text-accent`} />
            <p className="text-xs leading-snug text-text">{label}</p>
            <p className="mt-1 text-[10px] text-text-sub">{count}</p>
          </Link>
        ))}
      </div>
    </>
  );
}
