import { createBrowserClient } from "@supabase/ssr";
import { supabaseCookieOptions } from "@/lib/supabase/cookies";
import { getSupabaseBrowserUrl } from "@/lib/supabase/url";

function resolveBrowserSupabaseUrl(): string {
  const baseUrl = getSupabaseBrowserUrl();
  if (baseUrl.startsWith("http://") || baseUrl.startsWith("https://")) {
    return baseUrl;
  }
  if (baseUrl.startsWith("/")) {
    return `${window.location.origin}${baseUrl}`;
  }
  return baseUrl;
}

export function createClient() {
  return createBrowserClient(
    resolveBrowserSupabaseUrl(),
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookieOptions: supabaseCookieOptions },
  );
}
