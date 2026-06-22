import { SettingsAdmin } from "@/components/admin/settings-admin";
import { createClient } from "@/lib/supabase/server";
import type { Category, Tag } from "@/lib/types/database";

export default async function AdminSettingsPage() {
  const supabase = await createClient();

  const [{ data: categories }, { data: tags }, { data: messages }, { data: messageTags }] =
    await Promise.all([
      supabase.from("categories").select("*").order("created_at").returns<Category[]>(),
      supabase.from("tags").select("*").order("created_at").returns<Tag[]>(),
      supabase.from("messages").select("category_id"),
      supabase.from("message_tags").select("tag_id"),
    ]);

  const categoryCounts = new Map<string, number>();
  messages?.forEach((message) => {
    if (message.category_id) {
      categoryCounts.set(
        message.category_id,
        (categoryCounts.get(message.category_id) ?? 0) + 1,
      );
    }
  });

  const tagCounts = new Map<string, number>();
  messageTags?.forEach((entry) => {
    tagCounts.set(entry.tag_id, (tagCounts.get(entry.tag_id) ?? 0) + 1);
  });

  return (
    <SettingsAdmin
      categories={(categories ?? []).map((category) => ({
        ...category,
        count: categoryCounts.get(category.id) ?? 0,
      }))}
      tags={(tags ?? []).map((tag) => ({
        ...tag,
        count: tagCounts.get(tag.id) ?? 0,
      }))}
    />
  );
}
