import { AccessLogTracker } from "@/components/viewer/access-log-tracker";
import { ListPagination } from "@/components/viewer/list-pagination";
import { MutteringsContent } from "@/components/viewer/mutterings-content";
import { ShelfBackLink } from "@/components/viewer/shelf-back-link";
import { SubHeader } from "@/components/viewer/sub-header";
import { getSessionActor } from "@/lib/auth/session-actor";
import {
  clampPage,
  getPageRange,
  getTotalPages,
  parsePageParam,
} from "@/lib/pagination";
import { createClient } from "@/lib/supabase/server";
import type { Muttering, MutteringReply } from "@/lib/types/database";
import { redirect } from "next/navigation";

type MutteringsPageProps = {
  searchParams: Promise<{ page?: string }>;
};

export default async function MutteringsPage({ searchParams }: MutteringsPageProps) {
  const actor = await getSessionActor();
  if (!actor) {
    redirect("/login");
  }

  const params = await searchParams;
  const requestedPage = parsePageParam(params.page);

  const supabase = await createClient();
  const { count } = await supabase
    .from("mutterings")
    .select("*", { count: "exact", head: true });

  const totalPages = getTotalPages(count ?? 0);
  const page = clampPage(requestedPage, totalPages);
  const { from, to } = getPageRange(page);

  const { data: mutterings } = await supabase
    .from("mutterings")
    .select("*")
    .order("created_at", { ascending: false })
    .range(from, to)
    .returns<Muttering[]>();

  const mutteringIds = (mutterings ?? []).map((item) => item.id);
  let replies: MutteringReply[] = [];

  if (mutteringIds.length > 0) {
    const { data } = await supabase
      .from("muttering_replies")
      .select("*")
      .in("muttering_id", mutteringIds)
      .order("created_at", { ascending: true })
      .returns<MutteringReply[]>();
    replies = data ?? [];
  }

  const repliesByMutteringId = replies.reduce<Record<string, MutteringReply[]>>(
    (accumulator, reply) => {
      const list = accumulator[reply.muttering_id] ?? [];
      list.push(reply);
      accumulator[reply.muttering_id] = list;
      return accumulator;
    },
    {},
  );

  return (
    <>
      <AccessLogTracker pageType="つぶやき" />
      <ShelfBackLink />
      <SubHeader title="メス犬のつぶやき" subtitle="悠揮君の犬のうた" />
      <div className="px-5 pb-6">
        <MutteringsContent
          mutterings={mutterings ?? []}
          repliesByMutteringId={repliesByMutteringId}
          actor={actor}
        />
        <ListPagination basePath="/shelf/mutterings" page={page} totalPages={totalPages} />
      </div>
    </>
  );
}
