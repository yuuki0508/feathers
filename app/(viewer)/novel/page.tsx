import { AccessLogTracker } from "@/components/viewer/access-log-tracker";
import { NovelList } from "@/components/viewer/novel-list";
import { SubHeader } from "@/components/viewer/sub-header";
import { sortNovelsByDateDesc } from "@/lib/content-sort";
import { createClient } from "@/lib/supabase/server";
import type { Novel } from "@/lib/types/database";

export default async function NovelPage() {
  const supabase = await createClient();
  const { data: novels } = await supabase
    .from("novels")
    .select("id, title, body, created_at")
    .order("created_at", { ascending: false })
    .returns<Novel[]>();

  const sortedNovels = sortNovelsByDateDesc(novels ?? []);

  return (
    <>
      <AccessLogTracker pageType="お楽しみ一覧" />
      <SubHeader title="お楽しみ" subtitle="One Song From Two Hearts" />
      <div className="px-5">
        <NovelList novels={sortedNovels} />
      </div>
    </>
  );
}
