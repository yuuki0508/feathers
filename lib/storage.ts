import type { SupabaseClient } from "@supabase/supabase-js";

const SIGNED_URL_EXPIRY = 3600;

function extractStoragePath(photoUrl: string, bucket: string): string {
  if (photoUrl.startsWith("http") || photoUrl.startsWith("/")) {
    const marker = `/object/sign/${bucket}/`;
    const publicMarker = `/storage/v1/object/public/${bucket}/`;
    if (photoUrl.includes(marker)) {
      return photoUrl.split(marker)[1]?.split("?")[0] ?? photoUrl;
    }
    if (photoUrl.includes(publicMarker)) {
      return photoUrl.split(publicMarker)[1]?.split("?")[0] ?? photoUrl;
    }
  }
  return photoUrl.replace(new RegExp(`^${bucket}/`), "");
}

function toBrowserStorageUrl(signedUrl: string): string {
  if (!signedUrl.startsWith("http")) return signedUrl;

  try {
    const parsed = new URL(signedUrl);
    if (parsed.hostname.includes("supabase.co")) return signedUrl;
    return `/supabase-api${parsed.pathname}${parsed.search}`;
  } catch {
    return signedUrl;
  }
}

export async function getSignedPhotoUrl(
  supabase: SupabaseClient,
  photoUrl: string | null,
  bucket = "memories",
): Promise<string | null> {
  if (!photoUrl) return null;

  const path = extractStoragePath(photoUrl, bucket);
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, SIGNED_URL_EXPIRY);

  if (error || !data?.signedUrl) return null;
  return toBrowserStorageUrl(data.signedUrl);
}

export async function getSignedPhotoUrls(
  supabase: SupabaseClient,
  photoUrls: string[] | null | undefined,
  bucket = "memories",
): Promise<string[]> {
  const paths = (photoUrls ?? []).filter((path) => path.length > 0);
  const signed = await Promise.all(paths.map((path) => getSignedPhotoUrl(supabase, path, bucket)));
  return signed.filter((url): url is string => !!url);
}
