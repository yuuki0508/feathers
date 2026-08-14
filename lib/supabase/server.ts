import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { supabaseCookieOptions } from "@/lib/supabase/cookies";
import { getSupabaseServerUrl } from "@/lib/supabase/url";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    getSupabaseServerUrl(),
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookieOptions: supabaseCookieOptions,
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Server Component からの呼び出し時は set 不可
          }
        },
      },
    },
  );
}
