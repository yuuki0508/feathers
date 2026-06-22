import { AccessLogTracker } from "@/components/viewer/access-log-tracker";
import { DiaryList } from "@/components/viewer/diary-list";
import { ShelfBackLink } from "@/components/viewer/shelf-back-link";
import { SubHeader } from "@/components/viewer/sub-header";
import { createClient } from "@/lib/supabase/server";
import type { Diary } from "@/lib/types/database";

export default async function DiaryPage() {
  const supabase = await createClient();
  const { data: diaries } = await supabase
    .from("diaries")
    .select("*")
    .order("diary_date", { ascending: false })
    .returns<Diary[]>();

  return (
    <>
      <AccessLogTracker pageType="日記一覧" />
      <ShelfBackLink />
      <SubHeader title="日記" subtitle="空見るたびに想う君のこと" />
      <div className="px-5">
        <DiaryList diaries={diaries ?? []} />
      </div>
    </>
  );
}
