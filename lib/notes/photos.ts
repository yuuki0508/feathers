import { randomUUID } from "crypto";
import { NOTE_MAX_PHOTOS, NOTES_BUCKET } from "@/lib/notes/constants";
import { createClient } from "@/lib/supabase/server";

export function getNotePhotoFiles(formData: FormData): File[] {
  return formData
    .getAll("photos")
    .filter((value): value is File => value instanceof File && value.size > 0)
    .slice(0, NOTE_MAX_PHOTOS);
}

export function getKeptNotePhotoPaths(formData: FormData): string[] {
  return formData
    .getAll("keep_paths")
    .filter((value): value is string => typeof value === "string" && value.length > 0)
    .slice(0, NOTE_MAX_PHOTOS);
}

export async function uploadNotePhotos(
  files: File[],
): Promise<{ paths: string[]; error?: string }> {
  if (files.length === 0) {
    return { paths: [] };
  }

  const supabase = await createClient();
  const paths: string[] = [];
  const { compressMemoryPhoto } = await import("@/lib/image-compress");

  for (const file of files) {
    const originalBuffer = Buffer.from(await file.arrayBuffer());
    let uploadBuffer: Buffer = originalBuffer;
    let contentType = file.type || "image/jpeg";
    let extension = file.name.split(".").pop()?.toLowerCase() ?? "jpg";

    const isImage =
      file.type.startsWith("image/") ||
      /\.(jpe?g|png|gif|webp|heic|heif)$/i.test(file.name);

    if (isImage) {
      try {
        const compressed = await compressMemoryPhoto(originalBuffer);
        uploadBuffer = Buffer.from(compressed.buffer);
        contentType = compressed.contentType;
        extension = compressed.extension;
      } catch {
        // Vercel で sharp が読めない場合などは、クライアント圧縮済みの元ファイルを保存
      }
    }

    const path = `${randomUUID()}.${extension}`;
    const { error } = await supabase.storage.from(NOTES_BUCKET).upload(path, uploadBuffer, {
      contentType,
      upsert: false,
    });

    if (error) {
      await removeNotePhotos(paths);
      return { paths: [], error: error.message };
    }

    paths.push(path);
  }

  return { paths };
}

export async function removeNotePhotos(paths: Array<string | null | undefined>) {
  const validPaths = paths.filter((path): path is string => !!path);
  if (validPaths.length === 0) return;

  const supabase = await createClient();
  await supabase.storage.from(NOTES_BUCKET).remove(validPaths);
}
