"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { failAdmin } from "@/lib/actions/admin/utils";

function revalidateAdmin() {
  revalidatePath("/admin/novel");
  revalidatePath("/novel");
}

export async function createNovel(formData: FormData) {
  const title = formData.get("title");
  const body = formData.get("body");

  if (typeof title !== "string" || title.trim().length === 0) {
    failAdmin("タイトルを入力してください");
  }
  if (typeof body !== "string" || body.trim().length === 0) {
    failAdmin("本文を入力してください");
  }

  const supabase = await createClient();
  const { error } = await supabase.from("novels").insert({
    title: title.trim(),
    body: body.trim(),
  });

  if (error) failAdmin(error.message);
  revalidateAdmin();
}

export async function updateNovel(formData: FormData) {
  const id = formData.get("id");
  const title = formData.get("title");
  const body = formData.get("body");

  if (typeof id !== "string" || id.length === 0) failAdmin("IDが不正です");
  if (typeof title !== "string" || title.trim().length === 0) {
    failAdmin("タイトルを入力してください");
  }
  if (typeof body !== "string" || body.trim().length === 0) {
    failAdmin("本文を入力してください");
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("novels")
    .update({ title: title.trim(), body: body.trim() })
    .eq("id", id);

  if (error) failAdmin(error.message);
  revalidateAdmin();
}

export async function deleteNovel(formData: FormData) {
  const id = formData.get("id");
  if (typeof id !== "string" || id.length === 0) failAdmin("IDが不正です");

  const supabase = await createClient();
  const { error } = await supabase.from("novels").delete().eq("id", id);
  if (error) failAdmin(error.message);

  revalidateAdmin();
}
