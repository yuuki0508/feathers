"use server";

import { createAdminToken, ADMIN_COOKIE } from "@/lib/auth/admin-session";
import { getAuthEmail } from "@/lib/auth/emails";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function adminLoginAction(
  _prevState: { error: string } | null,
  formData: FormData,
) {
  const password = formData.get("password");
  const adminKey = formData.get("admin_key");

  if (typeof password !== "string" || password.length === 0) {
    return { error: "パスワードを入力してください" };
  }
  if (typeof adminKey !== "string" || adminKey.length === 0) {
    return { error: "管理用キーを入力してください" };
  }

  const expectedKey = process.env.ADMIN_SECRET;
  if (!expectedKey) {
    return { error: "管理用キーが設定されていません" };
  }
  if (adminKey !== expectedKey) {
    return { error: "管理用キーが正しくありません" };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: getAuthEmail(),
    password,
  });

  if (error || !data.user) {
    return { error: "パスワードが正しくありません" };
  }

  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE, await createAdminToken(data.user.id), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });

  redirect("/admin");
}

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();

  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  redirect("/admin/login");
}
