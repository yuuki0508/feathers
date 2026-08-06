import { ViewerActivityAdmin } from "@/components/admin/viewer-activity-admin";
import {
  buildViewerActivityItems,
  paginateViewerActivityItems,
} from "@/lib/admin/viewer-activity";
import { clampPage, parsePageParam } from "@/lib/pagination";
import { createClient } from "@/lib/supabase/server";
import type { KaraokeSong, Muttering, MutteringReply } from "@/lib/types/database";

const ADMIN_ACTIVITY_PAGE_SIZE = 30;

type ViewerActivityPageProps = {
  searchParams: Promise<{ page?: string }>;
};

export default async function AdminViewerActivityPage({
  searchParams,
}: ViewerActivityPageProps) {
  const params = await searchParams;
  const requestedPage = parsePageParam(params.page);

  const supabase = await createClient();
  const [{ data: mutterings }, { data: mutteringReplies }, { data: karaokeSongs }] =
    await Promise.all([
      supabase
        .from("mutterings")
        .select("id, body, created_at, updated_at")
        .order("created_at", { ascending: false })
        .returns<Muttering[]>(),
      supabase
        .from("muttering_replies")
        .select("id, body, author_type, muttering_id, created_at, updated_at, mutterings(body)")
        .eq("author_type", "viewer")
        .order("created_at", { ascending: false })
        .returns<
          Array<
            MutteringReply & {
              mutterings: Pick<Muttering, "body"> | null;
            }
          >
        >(),
      supabase
        .from("karaoke_songs")
        .select("id, title, status, proposed_by, created_at, updated_at")
        .order("created_at", { ascending: false })
        .returns<KaraokeSong[]>(),
    ]);

  const allItems = buildViewerActivityItems({
    mutterings: mutterings ?? [],
    mutteringReplies: mutteringReplies ?? [],
    karaokeSongs: karaokeSongs ?? [],
  });

  const { items, totalPages } = paginateViewerActivityItems(
    allItems,
    requestedPage,
    ADMIN_ACTIVITY_PAGE_SIZE,
  );
  const page = clampPage(requestedPage, totalPages);

  return <ViewerActivityAdmin items={items} page={page} totalPages={totalPages} />;
}
