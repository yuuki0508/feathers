"use server";

import { createClient } from "@/lib/supabase/server";
import { parseFormDateString } from "@/lib/format";
import { revalidatePath } from "next/cache";
import { failAdmin } from "@/lib/actions/admin/utils";

function revalidateAdmin() {
  revalidatePath("/admin/diary");
  revalidatePath("/shelf/diary");
  revalidatePath("/");
}

export async function createDiary(formData: FormData) {
  const title = formData.get("title");
  const body = formData.get("body");
  const diaryDate = formData.get("diary_date");

  if (typeof title !== "string" || title.trim().length === 0) {
    failAdmin("タイトルを入力してください");
  }
  if (typeof body !== "string" || body.trim().length === 0) {
    failAdmin("本文を入力してください");
  }

  const supabase = await createClient();
  const { error } = await supabase.from("diaries").insert({
    title: title.trim(),
    body: body.trim(),
    diary_date: parseFormDateString(diaryDate),
  });

  if (error) failAdmin(error.message);
  revalidateAdmin();
}

export async function updateDiary(formData: FormData) {
  const id = formData.get("id");
  const title = formData.get("title");
  const body = formData.get("body");
  const diaryDate = formData.get("diary_date");

  if (typeof id !== "string" || id.length === 0) failAdmin("IDが不正です");
  if (typeof title !== "string" || title.trim().length === 0) {
    failAdmin("タイトルを入力してください");
  }
  if (typeof body !== "string" || body.trim().length === 0) {
    failAdmin("本文を入力してください");
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("diaries")
    .update({
      title: title.trim(),
      body: body.trim(),
      diary_date: parseFormDateString(diaryDate),
    })
    .eq("id", id);

  if (error) failAdmin(error.message);
  revalidateAdmin();
}

export async function deleteDiary(formData: FormData) {
  const id = formData.get("id");
  if (typeof id !== "string" || id.length === 0) failAdmin("IDが不正です");

  const supabase = await createClient();
  const { error } = await supabase.from("diaries").delete().eq("id", id);
  if (error) failAdmin(error.message);

  revalidateAdmin();
}
