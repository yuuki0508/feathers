import type { SupabaseClient } from "@supabase/supabase-js";

const SIGNED_URL_EXPIRY = 3600;

function extractStoragePath(photoUrl: string): string {
  if (photoUrl.startsWith("http")) {
    const marker = "/object/sign/memories/";
    const publicMarker = "/storage/v1/object/public/memories/";
    if (photoUrl.includes(marker)) {
      return photoUrl.split(marker)[1]?.split("?")[0] ?? photoUrl;
    }
    if (photoUrl.includes(publicMarker)) {
      return photoUrl.split(publicMarker)[1]?.split("?")[0] ?? photoUrl;
    }
  }
  return photoUrl.replace(/^memories\//, "");
}

export async function getSignedPhotoUrl(
  supabase: SupabaseClient,
  photoUrl: string | null,
): Promise<string | null> {
  if (!photoUrl) return null;

  const path = extractStoragePath(photoUrl);
  const { data, error } = await supabase.storage
    .from("memories")
    .createSignedUrl(path, SIGNED_URL_EXPIRY);

  if (error || !data?.signedUrl) return null;
  return data.signedUrl;
}
