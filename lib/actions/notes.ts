"use server";

import { getSessionActor } from "@/lib/auth/session-actor";
import { NOTE_MAX_PHOTOS, validateNoteContent } from "@/lib/notes/constants";
import {
  getKeptNotePhotoPaths,
  getNotePhotoFiles,
  removeNotePhotos,
  uploadNotePhotos,
} from "@/lib/notes/photos";
import { createClient } from "@/lib/supabase/server";
import type { Note, NoteReply } from "@/lib/types/database";
import { revalidatePath } from "next/cache";

function revalidateNotes(page?: number) {
  revalidatePath("/shelf/notes");
  if (page && page > 1) {
    revalidatePath(`/shelf/notes?page=${page}`);
  }
  revalidatePath("/shelf");
}

async function getNote(id: string): Promise<Note | null> {
  const supabase = await createClient();
  const { data } = await supabase.from("notes").select("*").eq("id", id).maybeSingle<Note>();
  return data;
}

async function getReply(id: string): Promise<NoteReply | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("note_replies")
    .select("*")
    .eq("id", id)
    .maybeSingle<NoteReply>();
  return data;
}

function resolvePhotoPaths(
  existingPaths: string[] | null | undefined,
  keepPaths: string[],
  uploadedPaths: string[],
): { nextPaths: string[]; removedPaths: string[] } {
  const kept = keepPaths.filter((path) => (existingPaths ?? []).includes(path));
  const nextPaths = [...kept, ...uploadedPaths].slice(0, NOTE_MAX_PHOTOS);
  const removedPaths = (existingPaths ?? []).filter((path) => !kept.includes(path));
  return { nextPaths, removedPaths };
}

export async function createNote(formData: FormData) {
  const actor = await getSessionActor();
  if (!actor) {
    return { error: "ログインが必要です" };
  }

  const body = formData.get("body");
  if (typeof body !== "string") {
    return { error: "NOTEまたは写真を入力してください" };
  }

  const files = getNotePhotoFiles(formData);
  const validationError = validateNoteContent(body, files.length);
  if (validationError) {
    return { error: validationError };
  }

  const upload = await uploadNotePhotos(files);
  if (upload.error) {
    return { error: upload.error };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("notes").insert({
    body: body.trim(),
    author_type: actor,
    photo_paths: upload.paths,
  });

  if (error) {
    await removeNotePhotos(upload.paths);
    return { error: error.message };
  }

  revalidateNotes();
  return { success: true };
}

export async function updateNote(id: string, formData: FormData) {
  const actor = await getSessionActor();
  if (!actor) {
    return { error: "ログインが必要です" };
  }

  const body = formData.get("body");
  if (typeof body !== "string") {
    return { error: "NOTEまたは写真を入力してください" };
  }

  const note = await getNote(id);
  if (!note) {
    return { error: "NOTEが見つかりません" };
  }
  if (note.author_type !== actor) {
    return { error: "自分のNOTEだけ編集できます" };
  }

  const files = getNotePhotoFiles(formData);
  const keepPaths = getKeptNotePhotoPaths(formData);
  const validationError = validateNoteContent(body, keepPaths.length + files.length);
  if (validationError) {
    return { error: validationError };
  }

  const upload = await uploadNotePhotos(files);
  if (upload.error) {
    return { error: upload.error };
  }

  const { nextPaths, removedPaths } = resolvePhotoPaths(note.photo_paths, keepPaths, upload.paths);

  const supabase = await createClient();
  const { error } = await supabase
    .from("notes")
    .update({ body: body.trim(), photo_paths: nextPaths })
    .eq("id", id);

  if (error) {
    await removeNotePhotos(upload.paths);
    return { error: error.message };
  }

  await removeNotePhotos(removedPaths);
  revalidateNotes();
  return { success: true };
}

export async function deleteNote(id: string) {
  const actor = await getSessionActor();
  if (!actor) {
    return { error: "ログインが必要です" };
  }

  const note = await getNote(id);
  if (!note) {
    return { error: "NOTEが見つかりません" };
  }
  if (note.author_type !== actor) {
    return { error: "自分のNOTEだけ削除できます" };
  }

  const supabase = await createClient();
  const { data: replies } = await supabase
    .from("note_replies")
    .select("photo_paths")
    .eq("note_id", id)
    .returns<Pick<NoteReply, "photo_paths">[]>();

  const { error } = await supabase.from("notes").delete().eq("id", id);

  if (error) {
    return { error: error.message };
  }

  await removeNotePhotos([
    ...(note.photo_paths ?? []),
    ...(replies ?? []).flatMap((reply) => reply.photo_paths ?? []),
  ]);
  revalidateNotes();
  return { success: true };
}

export async function createNoteReply(noteId: string, formData: FormData) {
  const actor = await getSessionActor();
  if (!actor) {
    return { error: "ログインが必要です" };
  }

  const body = formData.get("body");
  if (typeof body !== "string") {
    return { error: "返信または写真を入力してください" };
  }

  const files = getNotePhotoFiles(formData);
  const validationError = validateNoteContent(body, files.length, "返信");
  if (validationError) {
    return { error: validationError };
  }

  const note = await getNote(noteId);
  if (!note) {
    return { error: "NOTEが見つかりません" };
  }

  const upload = await uploadNotePhotos(files);
  if (upload.error) {
    return { error: upload.error };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("note_replies").insert({
    note_id: noteId,
    body: body.trim(),
    author_type: actor,
    photo_paths: upload.paths,
  });

  if (error) {
    await removeNotePhotos(upload.paths);
    return { error: error.message };
  }

  revalidateNotes();
  return { success: true };
}

export async function updateNoteReply(id: string, formData: FormData) {
  const actor = await getSessionActor();
  if (!actor) {
    return { error: "ログインが必要です" };
  }

  const body = formData.get("body");
  if (typeof body !== "string") {
    return { error: "返信または写真を入力してください" };
  }

  const reply = await getReply(id);
  if (!reply) {
    return { error: "返信が見つかりません" };
  }
  if (reply.author_type !== actor) {
    return { error: "自分の返信だけ編集できます" };
  }

  const files = getNotePhotoFiles(formData);
  const keepPaths = getKeptNotePhotoPaths(formData);
  const validationError = validateNoteContent(body, keepPaths.length + files.length, "返信");
  if (validationError) {
    return { error: validationError };
  }

  const upload = await uploadNotePhotos(files);
  if (upload.error) {
    return { error: upload.error };
  }

  const { nextPaths, removedPaths } = resolvePhotoPaths(reply.photo_paths, keepPaths, upload.paths);

  const supabase = await createClient();
  const { error } = await supabase
    .from("note_replies")
    .update({ body: body.trim(), photo_paths: nextPaths })
    .eq("id", id);

  if (error) {
    await removeNotePhotos(upload.paths);
    return { error: error.message };
  }

  await removeNotePhotos(removedPaths);
  revalidateNotes();
  return { success: true };
}

export async function deleteNoteReply(id: string) {
  const actor = await getSessionActor();
  if (!actor) {
    return { error: "ログインが必要です" };
  }

  const reply = await getReply(id);
  if (!reply) {
    return { error: "返信が見つかりません" };
  }
  if (reply.author_type !== actor) {
    return { error: "自分の返信だけ削除できます" };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("note_replies").delete().eq("id", id);

  if (error) {
    return { error: error.message };
  }

  await removeNotePhotos(reply.photo_paths);
  revalidateNotes();
  return { success: true };
}
