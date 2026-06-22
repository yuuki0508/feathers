import { LikesAdmin } from "@/components/admin/likes-admin";
import { createClient } from "@/lib/supabase/server";
import type { Like } from "@/lib/types/database";

export default async function AdminLikesPage() {
  const supabase = await createClient();
  const { data: likes } = await supabase
    .from("likes")
    .select("*")
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: true })
    .returns<Like[]>();

  return <LikesAdmin likes={likes ?? []} />;
}
