"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { failAdmin } from "@/lib/actions/admin/utils";

function revalidateAdmin() {
  revalidatePath("/admin/settings");
  revalidatePath("/letter");
  revalidatePath("/admin/message");
}

export async function createCategory(formData: FormData) {
  const name = formData.get("name");
  if (typeof name !== "string" || name.trim().length === 0) {
    failAdmin("カテゴリ名を入力してください");
  }

  const supabase = await createClient();
  const { error } = await supabase.from("categories").insert({ name: name.trim() });
  if (error) failAdmin(error.message);

  revalidateAdmin();
}

export async function updateCategory(formData: FormData) {
  const id = formData.get("id");
  const name = formData.get("name");
  if (typeof id !== "string" || id.length === 0) failAdmin("IDが不正です");
  if (typeof name !== "string" || name.trim().length === 0) {
    failAdmin("カテゴリ名を入力してください");
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("categories")
    .update({ name: name.trim() })
    .eq("id", id);
  if (error) failAdmin(error.message);

  revalidateAdmin();
}

export async function deleteCategory(formData: FormData) {
  const id = formData.get("id");
  if (typeof id !== "string" || id.length === 0) failAdmin("IDが不正です");

  const supabase = await createClient();
  const { count } = await supabase
    .from("messages")
    .select("*", { count: "exact", head: true })
    .eq("category_id", id);

  if ((count ?? 0) > 0) {
    failAdmin("このカテゴリにはメッセージが紐づいているため削除できません");
  }

  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) failAdmin(error.message);

  revalidateAdmin();
}

export async function createTag(formData: FormData) {
  const name = formData.get("name");
  if (typeof name !== "string" || name.trim().length === 0) {
    failAdmin("タグ名を入力してください");
  }

  const supabase = await createClient();
  const { error } = await supabase.from("tags").insert({ name: name.trim() });
  if (error) failAdmin(error.message);

  revalidateAdmin();
}

export async function updateTag(formData: FormData) {
  const id = formData.get("id");
  const name = formData.get("name");
  if (typeof id !== "string" || id.length === 0) failAdmin("IDが不正です");
  if (typeof name !== "string" || name.trim().length === 0) {
    failAdmin("タグ名を入力してください");
  }

  const supabase = await createClient();
  const { error } = await supabase.from("tags").update({ name: name.trim() }).eq("id", id);
  if (error) failAdmin(error.message);

  revalidateAdmin();
}

export async function deleteTag(formData: FormData) {
  const id = formData.get("id");
  if (typeof id !== "string" || id.length === 0) failAdmin("IDが不正です");

  const supabase = await createClient();
  const { error } = await supabase.from("tags").delete().eq("id", id);
  if (error) failAdmin(error.message);

  revalidateAdmin();
}
