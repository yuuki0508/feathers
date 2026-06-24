import { createAdminClient } from "@/lib/supabase/admin";

export const ACCESS_LOG_RETENTION_DAYS = 45;

export function getAccessLogRetentionCutoff(
  now = new Date(),
  retentionDays = ACCESS_LOG_RETENTION_DAYS,
): Date {
  const cutoff = new Date(now);
  cutoff.setUTCDate(cutoff.getUTCDate() - retentionDays);
  return cutoff;
}

export async function deleteExpiredAccessLogs(
  retentionDays = ACCESS_LOG_RETENTION_DAYS,
): Promise<{ deletedCount: number; cutoff: string }> {
  const cutoff = getAccessLogRetentionCutoff(new Date(), retentionDays);
  const supabase = createAdminClient();

  const { error, count } = await supabase
    .from("access_logs")
    .delete({ count: "exact" })
    .lt("accessed_at", cutoff.toISOString());

  if (error) {
    throw new Error(error.message);
  }

  return {
    deletedCount: count ?? 0,
    cutoff: cutoff.toISOString(),
  };
}
