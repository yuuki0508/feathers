/** サーバー・middleware 用。Docker 内では host.docker.internal を使う */
export function getSupabaseServerUrl(): string {
  return (
    process.env.SUPABASE_INTERNAL_URL ??
    process.env.NEXT_PUBLIC_SUPABASE_URL ??
    ""
  );
}

/** ブラウザ用。ローカル開発では同一オリジンのプロキシ経由（WSL↔Windows のポート問題回避） */
export function getSupabaseBrowserUrl(): string {
  const publicUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  if (!publicUrl || publicUrl.includes("supabase.co")) {
    return publicUrl;
  }
  return "/supabase-api";
}
