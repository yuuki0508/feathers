"use server";

import { createClient } from "@/lib/supabase/server";
import { getTodayDateString } from "@/lib/format";
import { revalidatePath } from "next/cache";
import { failAdmin } from "@/lib/actions/admin/utils";

export async function updateTodayMessage(formData: FormData) {
  const body = formData.get("body");
  if (typeof body !== "string" || body.trim().length === 0) {
    failAdmin("本文を入力してください");
  }

  const supabase = await createClient();
  const today = getTodayDateString();
  const { data: existing } = await supabase
    .from("today_message")
    .select("id")
    .eq("display_date", today)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from("today_message")
      .update({ body: body.trim() })
      .eq("id", existing.id);
    if (error) failAdmin(error.message);
  } else {
    const { error } = await supabase
      .from("today_message")
      .insert({ body: body.trim(), display_date: today });
    if (error) failAdmin(error.message);
  }

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/shelf");
  revalidatePath("/shelf/today-history");
}
