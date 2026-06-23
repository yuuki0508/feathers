"use server";

import { randomUUID } from "crypto";
import { parseFormDateString } from "@/lib/format";
import { compressMemoryPhoto } from "@/lib/image-compress";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { failAdmin } from "@/lib/actions/admin/utils";

function revalidateAdmin() {
  revalidatePath("/admin/memory");
  revalidatePath("/shelf/memory");
  revalidatePath("/");
}

async function uploadPhotoFile(
  file: File,
): Promise<{ path?: string; error?: string }> {
  const supabase = await createClient();
  const originalBuffer = Buffer.from(await file.arrayBuffer());

  let uploadBuffer: Buffer = originalBuffer;
  let contentType = file.type || "image/jpeg";
  let extension = file.name.split(".").pop()?.toLowerCase() ?? "jpg";

  if (file.type.startsWith("image/")) {
    try {
      const compressed = await compressMemoryPhoto(originalBuffer);
      uploadBuffer = Buffer.from(compressed.buffer);
      contentType = compressed.contentType;
      extension = compressed.extension;
    } catch {
      // 非対応形式などは元ファイルのまま保存
    }
  }

  const path = `${randomUUID()}.${extension}`;

  const { error } = await supabase.storage.from("memories").upload(path, uploadBuffer, {
    contentType,
    upsert: false,
  });

  if (error) return { error: error.message };
  return { path };
}

async function uploadPhotoField(
  formData: FormData,
  fieldName: string,
): Promise<{ path?: string; error?: string }> {
  const file = formData.get(fieldName);
  if (!(file instanceof File) || file.size === 0) {
    return {};
  }
  return uploadPhotoFile(file);
}

async function removeStoragePhotos(paths: Array<string | null | undefined>) {
  const validPaths = paths.filter((path): path is string => !!path);
  if (validPaths.length === 0) return;

  const supabase = await createClient();
  await supabase.storage.from("memories").remove(validPaths);
}

export async function createMemory(formData: FormData) {
  const caption = formData.get("caption");
  const memoryDate = formData.get("memory_date");

  if (typeof caption !== "string" || caption.trim().length === 0) {
    failAdmin("一言を入力してください");
  }

  const [upload1, upload2] = await Promise.all([
    uploadPhotoField(formData, "photo"),
    uploadPhotoField(formData, "photo_2"),
  ]);
  if (upload1.error) failAdmin(upload1.error);
  if (upload2.error) failAdmin(upload2.error);

  const supabase = await createClient();
  const { error } = await supabase.from("memories").insert({
    caption: caption.trim(),
    memory_date: parseFormDateString(memoryDate),
    photo_url: upload1.path ?? null,
    photo_url_2: upload2.path ?? null,
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

  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("memories")
    .select("photo_url, photo_url_2")
    .eq("id", id)
    .maybeSingle();

  const [upload1, upload2] = await Promise.all([
    uploadPhotoField(formData, "photo"),
    uploadPhotoField(formData, "photo_2"),
  ]);
  if (upload1.error) failAdmin(upload1.error);
  if (upload2.error) failAdmin(upload2.error);

  const updates: Record<string, string | null> = {
    caption: caption.trim(),
    memory_date: parseFormDateString(memoryDate),
  };
  const pathsToRemove: string[] = [];

  if (upload1.path) {
    if (existing?.photo_url) pathsToRemove.push(existing.photo_url);
    updates.photo_url = upload1.path;
  }

  if (upload2.path) {
    if (existing?.photo_url_2) pathsToRemove.push(existing.photo_url_2);
    updates.photo_url_2 = upload2.path;
  }

  const { error } = await supabase.from("memories").update(updates).eq("id", id);
  if (error) failAdmin(error.message);

  await removeStoragePhotos(pathsToRemove);
  revalidateAdmin();
}

export async function deleteMemory(formData: FormData) {
  const id = formData.get("id");
  if (typeof id !== "string" || id.length === 0) failAdmin("IDが不正です");

  const supabase = await createClient();
  const { data: memory } = await supabase
    .from("memories")
    .select("photo_url, photo_url_2")
    .eq("id", id)
    .maybeSingle();

  const { error } = await supabase.from("memories").delete().eq("id", id);
  if (error) failAdmin(error.message);

  await removeStoragePhotos([memory?.photo_url, memory?.photo_url_2]);
  revalidateAdmin();
}
