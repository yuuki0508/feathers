import { AccessLogTracker } from "@/components/viewer/access-log-tracker";
import { ListPagination } from "@/components/viewer/list-pagination";
import { NovelList } from "@/components/viewer/novel-list";
import { SubHeader } from "@/components/viewer/sub-header";
import {
  clampPage,
  getPageRange,
  getTotalPages,
  parsePageParam,
} from "@/lib/pagination";
import { createClient } from "@/lib/supabase/server";
import type { Novel } from "@/lib/types/database";

type NovelPageProps = {
  searchParams: Promise<{ page?: string }>;
};

export default async function NovelPage({ searchParams }: NovelPageProps) {
  const params = await searchParams;
  const requestedPage = parsePageParam(params.page);

  const supabase = await createClient();
  const { count } = await supabase
    .from("novels")
    .select("*", { count: "exact", head: true });

  const totalPages = getTotalPages(count ?? 0);
  const page = clampPage(requestedPage, totalPages);
  const { from, to } = getPageRange(page);

  const { data: novels } = await supabase
    .from("novels")
    .select("id, title, body, created_at")
    .order("created_at", { ascending: false })
    .range(from, to)
    .returns<Novel[]>();

  return (
    <>
      <AccessLogTracker pageType="お楽しみ一覧" />
      <SubHeader title="お楽しみ" subtitle="One Song From Two Hearts" />
      <div className="px-5">
        <NovelList novels={novels ?? []} />
        <ListPagination basePath="/novel" page={page} totalPages={totalPages} />
      </div>
    </>
  );
}
