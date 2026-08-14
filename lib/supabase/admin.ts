import { createClient } from "@supabase/supabase-js";
import { getSupabaseServerUrl } from "@/lib/supabase/url";

export function createAdminClient() {
  const url = getSupabaseServerUrl();
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error("Supabase admin credentials are not configured");
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
