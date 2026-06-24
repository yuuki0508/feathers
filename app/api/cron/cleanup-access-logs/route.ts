import {
  ACCESS_LOG_RETENTION_DAYS,
  deleteExpiredAccessLogs,
} from "@/lib/access-log-retention";
import { NextResponse } from "next/server";

function isAuthorized(request: Request): boolean {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) return false;

  const authorization = request.headers.get("authorization");
  return authorization === `Bearer ${cronSecret}`;
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { deletedCount, cutoff } = await deleteExpiredAccessLogs();

    return NextResponse.json({
      ok: true,
      retentionDays: ACCESS_LOG_RETENTION_DAYS,
      cutoff,
      deletedCount,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Cleanup failed";
    console.error("[cron/cleanup-access-logs]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
