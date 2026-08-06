import { ADMIN_COOKIE, verifyAdminToken } from "@/lib/auth/admin-session";
import { createClient } from "@/lib/supabase/server";
import type { KaraokeActor } from "@/lib/types/database";
import { cookies } from "next/headers";

export async function getKaraokeActor(): Promise<KaraokeActor | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const adminToken = (await cookies()).get(ADMIN_COOKIE)?.value;
  const isAdmin = await verifyAdminToken(user.id, adminToken);
  return isAdmin ? "admin" : "viewer";
}
