import { AccessLogTracker } from "@/components/viewer/access-log-tracker";
import { MemoryCard } from "@/components/viewer/memory-card";
import { ListPagination } from "@/components/viewer/list-pagination";
import { ShelfBackLink } from "@/components/viewer/shelf-back-link";
import { SubHeader } from "@/components/viewer/sub-header";
import {
  clampPage,
  getPageRange,
  getTotalPages,
  parsePageParam,
} from "@/lib/pagination";
import { getSignedPhotoUrl } from "@/lib/storage";
import { createClient } from "@/lib/supabase/server";
import type { Memory } from "@/lib/types/database";

type MemoryPageProps = {
  searchParams: Promise<{ page?: string }>;
};

export default async function MemoryPage({ searchParams }: MemoryPageProps) {
  const params = await searchParams;
  const requestedPage = parsePageParam(params.page);

  const supabase = await createClient();
  const { count } = await supabase
    .from("memories")
    .select("*", { count: "exact", head: true });

  const totalPages = getTotalPages(count ?? 0);
  const page = clampPage(requestedPage, totalPages);
  const { from, to } = getPageRange(page);

  const { data: memories } = await supabase
    .from("memories")
    .select("*")
    .order("memory_date", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false })
    .range(from, to)
    .returns<Memory[]>();

  const memoriesWithPhotos = await Promise.all(
    (memories ?? []).map(async (memory) => {
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
        <ListPagination basePath="/shelf/memory" page={page} totalPages={totalPages} />
      </div>
    </>
  );
}
