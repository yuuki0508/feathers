"use server";

import { isRedirectError } from "next/dist/client/components/redirect-error";
import { createClient } from "@/lib/supabase/server";
import { dateStringToJstNoonIso, parseFormDateString, resolvePostedCreatedAt } from "@/lib/format";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { failAdmin } from "@/lib/actions/admin/utils";

export type NovelFormState = { error: string | null };

function revalidateAdmin() {
  revalidatePath("/admin/novel");
  revalidatePath("/novel");
  revalidatePath("/");
}

async function createNovel(formData: FormData) {
  const title = formData.get("title");
  const body = formData.get("body");

  if (typeof title !== "string" || title.trim().length === 0) {
    failAdmin("タイトルを入力してください");
  }
  if (typeof body !== "string" || body.trim().length === 0) {
    failAdmin("本文を入力してください");
  }

  const supabase = await createClient();
  const postedDate = parseFormDateString(formData.get("posted_date"));
  const { error } = await supabase.from("novels").insert({
    title: title.trim(),
    body: body.trim(),
    created_at: resolvePostedCreatedAt(postedDate),
  });

  if (error) failAdmin(error.message);
}

async function updateNovel(formData: FormData) {
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
  const postedDate = parseFormDateString(formData.get("posted_date"));
  const { error } = await supabase
    .from("novels")
    .update({
      title: title.trim(),
      body: body.trim(),
      created_at: dateStringToJstNoonIso(postedDate),
    })
    .eq("id", id);

  if (error) failAdmin(error.message);
}

export async function saveNovelAction(
  _prevState: NovelFormState,
  formData: FormData,
): Promise<NovelFormState> {
  try {
    const id = formData.get("id");
    if (typeof id === "string" && id.length > 0) {
      await updateNovel(formData);
    } else {
      await createNovel(formData);
    }

    revalidateAdmin();
    redirect("/admin/novel");
  } catch (error) {
    if (isRedirectError(error)) throw error;
    return {
      error: error instanceof Error ? error.message : "保存に失敗しました",
    };
  }
}

export async function deleteNovel(formData: FormData) {
  const id = formData.get("id");
  if (typeof id !== "string" || id.length === 0) failAdmin("IDが不正です");

  const supabase = await createClient();
  const { error } = await supabase.from("novels").delete().eq("id", id);
  if (error) failAdmin(error.message);

  revalidateAdmin();
}
