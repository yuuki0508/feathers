"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

function revalidateWishlist() {
  revalidatePath("/shelf/wishlist");
  revalidatePath("/shelf");
  revalidatePath("/");
}

export async function createWishlistItem(formData: FormData) {
  const body = formData.get("body");
  if (typeof body !== "string" || body.trim().length === 0) {
    return { error: "やりたいことを入力してください" };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("wishlist_items").insert({
    body: body.trim(),
    is_done: false,
  });

  if (error) {
    return { error: error.message };
  }

  revalidateWishlist();
  return { success: true };
}

export async function toggleWishlistItem(id: string, isDone: boolean) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("wishlist_items")
    .update({ is_done: isDone })
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidateWishlist();
}

export async function updateWishlistItem(id: string, body: string) {
  if (typeof body !== "string" || body.trim().length === 0) {
    return { error: "やりたいことを入力してください" };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("wishlist_items")
    .update({ body: body.trim() })
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidateWishlist();
  return { success: true };
}

export async function deleteWishlistItem(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("wishlist_items").delete().eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidateWishlist();
  return { success: true };
}
