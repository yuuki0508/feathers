import { MemoryAdmin } from "@/components/admin/memory-admin";
import { createClient } from "@/lib/supabase/server";
import type { Memory } from "@/lib/types/database";

export default async function AdminMemoryPage() {
  const supabase = await createClient();
  const { data: memories } = await supabase
    .from("memories")
    .select("*")
    .order("memory_date", { ascending: false })
    .returns<Memory[]>();

  return <MemoryAdmin memories={memories ?? []} />;
}
