import { AccessLogTracker } from "@/components/viewer/access-log-tracker";
import { KaraokeContent } from "@/components/viewer/karaoke-content";
import { ShelfBackLink } from "@/components/viewer/shelf-back-link";
import { SubHeader } from "@/components/viewer/sub-header";
import { getKaraokeActor } from "@/lib/karaoke/get-actor";
import { createClient } from "@/lib/supabase/server";
import type { KaraokeSong } from "@/lib/types/database";
import { redirect } from "next/navigation";

export default async function KaraokePage() {
  const actor = await getKaraokeActor();
  if (!actor) {
    redirect("/login");
  }

  const supabase = await createClient();
  const { data: songs } = await supabase
    .from("karaoke_songs")
    .select("*")
    .order("created_at", { ascending: false })
    .returns<KaraokeSong[]>();

  return (
    <>
      <AccessLogTracker pageType="カラオケ" />
      <ShelfBackLink />
      <SubHeader title="カラオケ" subtitle="君への主題歌" />
      <div className="px-5 pb-6">
        <KaraokeContent songs={songs ?? []} actor={actor} />
      </div>
    </>
  );
}
