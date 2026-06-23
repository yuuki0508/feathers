"use server";

import { randomUUID } from "crypto";
import { parseFormDateString } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { failAdmin } from "@/lib/actions/admin/utils";

function revalidateAdmin() {
  revalidatePath("/admin/memory");
  revalidatePath("/shelf/memory");
  revalidatePath("/");
}

async function uploadPhoto(formData: FormData): Promise<{ path?: string; error?: string }> {
  const file = formData.get("photo");
  if (!(file instanceof File) || file.size === 0) {
    return {};
  }

  const extension = file.name.split(".").pop() ?? "jpg";
  const path = `${randomUUID()}.${extension}`;
  const supabase = await createClient();
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error } = await supabase.storage.from("memories").upload(path, buffer, {
    contentType: file.type || "image/jpeg",
    upsert: false,
  });

  if (error) return { error: error.message };
  return { path };
}

export async function createMemory(formData: FormData) {
  const caption = formData.get("caption");
  const memoryDate = formData.get("memory_date");

  if (typeof caption !== "string" || caption.trim().length === 0) {
    failAdmin("一言を入力してください");
  }

  const upload = await uploadPhoto(formData);
  if (upload.error) failAdmin(upload.error);

  const supabase = await createClient();
  const { error } = await supabase.from("memories").insert({
    caption: caption.trim(),
    memory_date: parseFormDateString(memoryDate),
    photo_url: upload.path ?? null,
  });

  if (error) failAdmin(error.message);
  revalidateAdmin();
  redirect("/admin/memory");
}

export async function updateMemory(formData: FormData) {
  const id = formData.get("id");
  const caption = formData.get("caption");
  const memoryDate = formData.get("memory_date");

  if (typeof id !== "string" || id.length === 0) failAdmin("IDが不正です");
  if (typeof caption !== "string" || caption.trim().length === 0) {
    failAdmin("一言を入力してください");
  }

  const upload = await uploadPhoto(formData);
  if (upload.error) failAdmin(upload.error);

  const updates: Record<string, string | null> = {
    caption: caption.trim(),
    memory_date: parseFormDateString(memoryDate),
  };

  if (upload.path) {
    updates.photo_url = upload.path;
  }

  const supabase = await createClient();
  const { error } = await supabase.from("memories").update(updates).eq("id", id);
  if (error) failAdmin(error.message);

  revalidateAdmin();
}

export async function deleteMemory(formData: FormData) {
  const id = formData.get("id");
  if (typeof id !== "string" || id.length === 0) failAdmin("IDが不正です");

  const supabase = await createClient();
  const { data: memory } = await supabase
    .from("memories")
    .select("photo_url")
    .eq("id", id)
    .maybeSingle();

  const { error } = await supabase.from("memories").delete().eq("id", id);
  if (error) failAdmin(error.message);

  if (memory?.photo_url) {
    await supabase.storage.from("memories").remove([memory.photo_url]);
  }

  revalidateAdmin();
}
