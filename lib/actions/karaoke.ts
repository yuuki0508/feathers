"use server";

import {
  canEditKaraokeSong,
  canRespondToKaraokeSong,
} from "@/lib/karaoke/rules";
import { getKaraokeActor } from "@/lib/karaoke/get-actor";
import { createClient } from "@/lib/supabase/server";
import type { KaraokeSong } from "@/lib/types/database";
import { revalidatePath } from "next/cache";

function revalidateKaraoke() {
  revalidatePath("/shelf/karaoke");
  revalidatePath("/shelf");
}

async function getSong(id: string): Promise<KaraokeSong | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("karaoke_songs")
    .select("*")
    .eq("id", id)
    .maybeSingle<KaraokeSong>();
  return data;
}

export async function createKaraokeSong(formData: FormData) {
  const actor = await getKaraokeActor();
  if (!actor) {
    return { error: "ログインが必要です" };
  }

  const title = formData.get("title");
  if (typeof title !== "string" || title.trim().length === 0) {
    return { error: "曲名を入力してください" };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("karaoke_songs").insert({
    title: title.trim(),
    status: "pending",
    proposed_by: actor,
  });

  if (error) {
    return { error: error.message };
  }

  revalidateKaraoke();
  return { success: true };
}

export async function updateKaraokeSong(id: string, title: string) {
  const actor = await getKaraokeActor();
  if (!actor) {
    return { error: "ログインが必要です" };
  }
  if (typeof title !== "string" || title.trim().length === 0) {
    return { error: "曲名を入力してください" };
  }

  const song = await getSong(id);
  if (!song) {
    return { error: "曲が見つかりません" };
  }
  if (!canEditKaraokeSong(song.proposed_by, actor, song.status)) {
    return { error: "自分が追加した候補だけ編集できます" };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("karaoke_songs")
    .update({ title: title.trim() })
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidateKaraoke();
  return { success: true };
}

export async function deleteKaraokeSong(id: string) {
  const actor = await getKaraokeActor();
  if (!actor) {
    return { error: "ログインが必要です" };
  }

  const song = await getSong(id);
  if (!song) {
    return { error: "曲が見つかりません" };
  }
  if (!canEditKaraokeSong(song.proposed_by, actor, song.status)) {
    return { error: "自分が追加した候補だけ削除できます" };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("karaoke_songs").delete().eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidateKaraoke();
  return { success: true };
}

export async function approveKaraokeSong(id: string) {
  const actor = await getKaraokeActor();
  if (!actor) {
    return { error: "ログインが必要です" };
  }

  const song = await getSong(id);
  if (!song) {
    return { error: "曲が見つかりません" };
  }
  if (song.status !== "pending") {
    return { error: "すでに返事済みです" };
  }
  if (!canRespondToKaraokeSong(song.proposed_by, actor)) {
    return { error: "自分が追加した候補には返事できません" };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("karaoke_songs")
    .update({ status: "approved" })
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidateKaraoke();
  return { success: true };
}

export async function rejectKaraokeSong(id: string) {
  const actor = await getKaraokeActor();
  if (!actor) {
    return { error: "ログインが必要です" };
  }

  const song = await getSong(id);
  if (!song) {
    return { error: "曲が見つかりません" };
  }
  if (song.status !== "pending") {
    return { error: "すでに返事済みです" };
  }
  if (!canRespondToKaraokeSong(song.proposed_by, actor)) {
    return { error: "自分が追加した候補には返事できません" };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("karaoke_songs")
    .update({ status: "rejected" })
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidateKaraoke();
  return { success: true };
}
