import { NovelAdmin } from "@/components/admin/novel-admin";
import { sortNovelsByDateDesc } from "@/lib/content-sort";
import { createClient } from "@/lib/supabase/server";
import type { Novel } from "@/lib/types/database";

export default async function AdminNovelPage() {
  const supabase = await createClient();
  const { data: novels } = await supabase
    .from("novels")
    .select("*")
    .order("created_at", { ascending: false })
    .returns<Novel[]>();

  return <NovelAdmin novels={sortNovelsByDateDesc(novels ?? [])} />;
}
