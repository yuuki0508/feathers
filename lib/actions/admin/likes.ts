"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { failAdmin } from "@/lib/actions/admin/utils";

function revalidateAdmin() {
  revalidatePath("/admin/likes");
  revalidatePath("/shelf/likes");
}

export async function createLike(formData: FormData) {
  const body = formData.get("body");
  if (typeof body !== "string" || body.trim().length === 0) {
    failAdmin("内容を入力してください");
  }

  const supabase = await createClient();
  const { data: lastLike } = await supabase
    .from("likes")
    .select("display_order")
    .order("display_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  const nextOrder = (lastLike?.display_order ?? 0) + 1;
  const { error } = await supabase.from("likes").insert({
    body: body.trim(),
    display_order: nextOrder,
  });

  if (error) failAdmin(error.message);
  revalidateAdmin();
}

export async function deleteLike(formData: FormData) {
  const id = formData.get("id");
  if (typeof id !== "string" || id.length === 0) failAdmin("IDが不正です");

  const supabase = await createClient();
  const { error } = await supabase.from("likes").delete().eq("id", id);
  if (error) failAdmin(error.message);

  revalidateAdmin();
}
