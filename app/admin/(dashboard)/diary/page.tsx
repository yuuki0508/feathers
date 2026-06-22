import { DiaryAdmin } from "@/components/admin/diary-admin";
import { createClient } from "@/lib/supabase/server";
import type { Diary } from "@/lib/types/database";

export default async function AdminDiaryPage() {
  const supabase = await createClient();
  const { data: diaries } = await supabase
    .from("diaries")
    .select("*")
    .order("diary_date", { ascending: false })
    .returns<Diary[]>();

  return <DiaryAdmin diaries={diaries ?? []} />;
}
