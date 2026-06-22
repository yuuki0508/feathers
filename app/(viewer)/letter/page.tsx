import { AccessLogTracker } from "@/components/viewer/access-log-tracker";
import { LetterContent } from "@/components/viewer/letter-content";
import { SubHeader } from "@/components/viewer/sub-header";
import { createClient } from "@/lib/supabase/server";
import type { Category, Message } from "@/lib/types/database";

export default async function LetterPage() {
  const supabase = await createClient();

  const [{ data: categories }, { data: messages }] = await Promise.all([
    supabase
      .from("categories")
      .select("*")
      .order("created_at", { ascending: true })
      .returns<Category[]>(),
    supabase
      .from("messages")
      .select("*, categories(name)")
      .order("created_at", { ascending: false })
      .returns<Message[]>(),
  ]);

  return (
    <>
      <AccessLogTracker pageType="手紙一覧" />
      <SubHeader title="手紙" subtitle="淋しい夜には、いつでも" />
      <LetterContent
        categories={categories ?? []}
        messages={messages ?? []}
      />
    </>
  );
}
