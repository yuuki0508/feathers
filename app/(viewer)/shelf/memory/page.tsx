import { AccessLogTracker } from "@/components/viewer/access-log-tracker";
import { MemoryCard } from "@/components/viewer/memory-card";
import { ShelfBackLink } from "@/components/viewer/shelf-back-link";
import { SubHeader } from "@/components/viewer/sub-header";
import { sortMemoriesByDateDesc } from "@/lib/content-sort";
import { getSignedPhotoUrl } from "@/lib/storage";
import { createClient } from "@/lib/supabase/server";
import type { Memory } from "@/lib/types/database";

export default async function MemoryPage() {
  const supabase = await createClient();
  const { data: memories } = await supabase
    .from("memories")
    .select("*")
    .order("memory_date", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false })
    .returns<Memory[]>();

  const sortedMemories = sortMemoriesByDateDesc(memories ?? []);

  const memoriesWithPhotos = await Promise.all(
    sortedMemories.map(async (memory) => {
      const photoUrls = (
        await Promise.all([
          getSignedPhotoUrl(supabase, memory.photo_url),
          getSignedPhotoUrl(supabase, memory.photo_url_2),
        ])
      ).filter((url): url is string => !!url);

      return {
        ...memory,
        photoUrls,
      };
    }),
  );

  return (
    <>
      <AccessLogTracker pageType="思い出一覧" />
      <ShelfBackLink />
      <SubHeader title="思い出" subtitle="Million Films" />
      <div className="px-5">
        {memoriesWithPhotos.length > 0 ? (
          memoriesWithPhotos.map((memory) => (
            <MemoryCard
              key={memory.id}
              id={memory.id}
              caption={memory.caption}
              memoryDate={memory.memory_date}
              photoUrls={memory.photoUrls}
            />
          ))
        ) : (
          <p className="rounded-[18px] border border-border bg-card px-5 py-8 text-center text-sm text-text-sub">
            まだ思い出がありません。
          </p>
        )}
      </div>
    </>
  );
}
