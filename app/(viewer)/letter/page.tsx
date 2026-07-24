import { AccessLogTracker } from "@/components/viewer/access-log-tracker";
import { LetterContent } from "@/components/viewer/letter-content";
import { SubHeader } from "@/components/viewer/sub-header";
import {
  clampPage,
  getPageRange,
  getTotalPages,
  parsePageParam,
} from "@/lib/pagination";
import { createClient } from "@/lib/supabase/server";
import type { Category, Message } from "@/lib/types/database";

type LetterPageProps = {
  searchParams: Promise<{ page?: string; category?: string }>;
};

export default async function LetterPage({ searchParams }: LetterPageProps) {
  const params = await searchParams;
  const requestedPage = parsePageParam(params.page);
  const categoryId = params.category?.trim() || null;

  const supabase = await createClient();

  const [{ data: categories }, countResult] = await Promise.all([
    supabase
      .from("categories")
      .select("*")
      .order("created_at", { ascending: true })
      .returns<Category[]>(),
    (() => {
      let query = supabase
        .from("messages")
        .select("*", { count: "exact", head: true });
      if (categoryId) {
        query = query.eq("category_id", categoryId);
      }
      return query;
    })(),
  ]);

  const totalCount = countResult.count ?? 0;
  const totalPages = getTotalPages(totalCount);
  const page = clampPage(requestedPage, totalPages);
  const { from, to } = getPageRange(page);

  let messagesQuery = supabase
    .from("messages")
    .select("*, categories(name)")
    .order("created_at", { ascending: false })
    .range(from, to);

  if (categoryId) {
    messagesQuery = messagesQuery.eq("category_id", categoryId);
  }

  const { data: messages } = await messagesQuery.returns<Message[]>();

  return (
    <>
      <AccessLogTracker pageType="手紙一覧" />
      <SubHeader title="手紙" subtitle="そんな自分を、時々は。" />
      <LetterContent
        categories={categories ?? []}
        messages={messages ?? []}
        selectedCategoryId={categoryId}
        page={page}
        totalPages={totalPages}
      />
    </>
  );
}
