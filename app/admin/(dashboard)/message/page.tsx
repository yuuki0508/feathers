import { MessageAdmin } from "@/components/admin/message-admin";
import { createClient } from "@/lib/supabase/server";
import type { Category, MessageWithTags, Tag } from "@/lib/types/database";

export default async function AdminMessagePage() {
  const supabase = await createClient();

  const [{ data: categories }, { data: tags }, { data: messages }] = await Promise.all([
    supabase.from("categories").select("*").order("created_at").returns<Category[]>(),
    supabase.from("tags").select("*").order("created_at").returns<Tag[]>(),
    supabase
      .from("messages")
      .select("*, categories(name), message_tags(tag_id, tags(name))")
      .order("created_at", { ascending: false })
      .returns<MessageWithTags[]>(),
  ]);

  return (
    <MessageAdmin
      categories={categories ?? []}
      tags={tags ?? []}
      messages={messages ?? []}
    />
  );
}
