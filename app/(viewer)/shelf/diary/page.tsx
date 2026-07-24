import { AccessLogTracker } from "@/components/viewer/access-log-tracker";
import { DiaryList } from "@/components/viewer/diary-list";
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
import type { Diary } from "@/lib/types/database";

type DiaryPageProps = {
  searchParams: Promise<{ page?: string }>;
};

export default async function DiaryPage({ searchParams }: DiaryPageProps) {
  const params = await searchParams;
  const requestedPage = parsePageParam(params.page);

  const supabase = await createClient();
  const { count } = await supabase
    .from("diaries")
    .select("*", { count: "exact", head: true });

  const totalPages = getTotalPages(count ?? 0);
  const page = clampPage(requestedPage, totalPages);
  const { from, to } = getPageRange(page);

  const { data: diaries } = await supabase
    .from("diaries")
    .select("*")
    .order("diary_date", { ascending: false })
    .range(from, to)
    .returns<Diary[]>();

  return (
    <>
      <AccessLogTracker pageType="日記一覧" />
      <ShelfBackLink />
      <SubHeader title="日記" subtitle="空見るたびに想う君のこと" />
      <div className="px-5">
        <DiaryList diaries={diaries ?? []} />
        <ListPagination basePath="/shelf/diary" page={page} totalPages={totalPages} />
      </div>
    </>
  );
}
