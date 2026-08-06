"use server";

import { getSessionActor } from "@/lib/auth/session-actor";
import { validateMutteringBody } from "@/lib/mutterings/constants";
import { createClient } from "@/lib/supabase/server";
import type { Muttering, MutteringReply } from "@/lib/types/database";
import { revalidatePath } from "next/cache";

function revalidateMutterings(page?: number) {
  revalidatePath("/shelf/mutterings");
  if (page && page > 1) {
    revalidatePath(`/shelf/mutterings?page=${page}`);
  }
  revalidatePath("/shelf");
}

async function getMuttering(id: string): Promise<Muttering | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("mutterings")
    .select("*")
    .eq("id", id)
    .maybeSingle<Muttering>();
  return data;
}

async function getReply(id: string): Promise<MutteringReply | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("muttering_replies")
    .select("*")
    .eq("id", id)
    .maybeSingle<MutteringReply>();
  return data;
}

export async function createMuttering(formData: FormData) {
  const actor = await getSessionActor();
  if (!actor) {
    return { error: "ログインが必要です" };
  }
  if (actor !== "viewer") {
    return { error: "つぶやきは彼女だけが投稿できます" };
  }

  const body = formData.get("body");
  if (typeof body !== "string") {
    return { error: "つぶやきを入力してください" };
  }
  const validationError = validateMutteringBody(body);
  if (validationError) {
    return { error: validationError };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("mutterings").insert({
    body: body.trim(),
  });

  if (error) {
    return { error: error.message };
  }

  revalidateMutterings();
  return { success: true };
}

export async function updateMuttering(id: string, body: string) {
  const actor = await getSessionActor();
  if (!actor) {
    return { error: "ログインが必要です" };
  }
  if (actor !== "viewer") {
    return { error: "つぶやきは彼女だけが編集できます" };
  }

  const validationError = validateMutteringBody(body);
  if (validationError) {
    return { error: validationError };
  }

  const muttering = await getMuttering(id);
  if (!muttering) {
    return { error: "つぶやきが見つかりません" };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("mutterings")
    .update({ body: body.trim() })
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidateMutterings();
  return { success: true };
}

export async function deleteMuttering(id: string) {
  const actor = await getSessionActor();
  if (!actor) {
    return { error: "ログインが必要です" };
  }
  if (actor !== "viewer") {
    return { error: "つぶやきは彼女だけが削除できます" };
  }

  const muttering = await getMuttering(id);
  if (!muttering) {
    return { error: "つぶやきが見つかりません" };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("mutterings").delete().eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidateMutterings();
  return { success: true };
}

export async function createMutteringReply(mutteringId: string, formData: FormData) {
  const actor = await getSessionActor();
  if (!actor) {
    return { error: "ログインが必要です" };
  }

  const body = formData.get("body");
  if (typeof body !== "string") {
    return { error: "返信を入力してください" };
  }
  const validationError = validateMutteringBody(body);
  if (validationError) {
    return { error: validationError.replace("つぶやき", "返信") };
  }

  const muttering = await getMuttering(mutteringId);
  if (!muttering) {
    return { error: "つぶやきが見つかりません" };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("muttering_replies").insert({
    muttering_id: mutteringId,
    body: body.trim(),
    author_type: actor,
  });

  if (error) {
    return { error: error.message };
  }

  revalidateMutterings();
  return { success: true };
}

export async function updateMutteringReply(id: string, body: string) {
  const actor = await getSessionActor();
  if (!actor) {
    return { error: "ログインが必要です" };
  }

  const validationError = validateMutteringBody(body);
  if (validationError) {
    return { error: validationError.replace("つぶやき", "返信") };
  }

  const reply = await getReply(id);
  if (!reply) {
    return { error: "返信が見つかりません" };
  }
  if (reply.author_type !== actor) {
    return { error: "自分の返信だけ編集できます" };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("muttering_replies")
    .update({ body: body.trim() })
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidateMutterings();
  return { success: true };
}

export async function deleteMutteringReply(id: string) {
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
  const { error } = await supabase.from("muttering_replies").delete().eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidateMutterings();
  return { success: true };
}
