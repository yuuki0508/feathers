"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { failAdmin } from "@/lib/actions/admin/utils";

function revalidateAdmin() {
  revalidatePath("/admin/message");
  revalidatePath("/letter");
  revalidatePath("/");
}

function parseTagIds(formData: FormData): string[] {
  return formData
    .getAll("tag_ids")
    .filter((value): value is string => typeof value === "string" && value.length > 0);
}

async function syncMessageTags(messageId: string, tagIds: string[]) {
  const supabase = await createClient();
  await supabase.from("message_tags").delete().eq("message_id", messageId);

  if (tagIds.length === 0) return;

  await supabase.from("message_tags").insert(
    tagIds.map((tagId) => ({ message_id: messageId, tag_id: tagId })),
  );
}

export async function createMessage(formData: FormData) {
  const body = formData.get("body");
  const categoryId = formData.get("category_id");

  if (typeof body !== "string" || body.trim().length === 0) {
    failAdmin("本文を入力してください");
  }
  if (typeof categoryId !== "string" || categoryId.length === 0) {
    failAdmin("カテゴリを選択してください");
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("messages")
    .insert({ body: body.trim(), category_id: categoryId })
    .select("id")
    .single();

  if (error || !data) failAdmin(error?.message ?? "保存に失敗しました");

  await syncMessageTags(data.id, parseTagIds(formData));
  revalidateAdmin();
}

export async function updateMessage(formData: FormData) {
  const id = formData.get("id");
  const body = formData.get("body");
  const categoryId = formData.get("category_id");

  if (typeof id !== "string" || id.length === 0) failAdmin("IDが不正です");
  if (typeof body !== "string" || body.trim().length === 0) {
    failAdmin("本文を入力してください");
  }
  if (typeof categoryId !== "string" || categoryId.length === 0) {
    failAdmin("カテゴリを選択してください");
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("messages")
    .update({ body: body.trim(), category_id: categoryId })
    .eq("id", id);

  if (error) failAdmin(error.message);

  await syncMessageTags(id, parseTagIds(formData));
  revalidateAdmin();
}

export async function deleteMessage(formData: FormData) {
  const id = formData.get("id");
  if (typeof id !== "string" || id.length === 0) failAdmin("IDが不正です");

  const supabase = await createClient();
  const { error } = await supabase.from("messages").delete().eq("id", id);
  if (error) failAdmin(error.message);

  revalidateAdmin();
}
