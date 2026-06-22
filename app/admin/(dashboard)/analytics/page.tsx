import { AnalyticsDashboard } from "@/components/admin/analytics-dashboard";
import {
  buildCategoryCounts,
  buildContentRanking,
  getPeriodRange,
} from "@/lib/analytics";
import { createClient } from "@/lib/supabase/server";
import type { AccessLog } from "@/lib/types/database";

export default async function AdminAnalyticsPage() {
  const supabase = await createClient();

  const [{ data: logs }, { data: messages }] = await Promise.all([
    supabase
      .from("access_logs")
      .select("*")
      .order("accessed_at", { ascending: false })
      .returns<AccessLog[]>(),
    supabase.from("messages").select("id, category_id, categories(name)"),
  ]);

  const allLogs = logs ?? [];
  const messageCategories = new Map<string, string>();

  messages?.forEach((message) => {
    const categoryName =
      message.categories &&
      typeof message.categories === "object" &&
      "name" in message.categories
        ? String(message.categories.name)
        : "未分類";
    messageCategories.set(message.id, categoryName);
  });

  const letterLogs = allLogs.filter((log) => log.page_type === "手紙");
  const categoryCounts = await buildCategoryCounts(letterLogs, messageCategories);

  const thisMonthRange = getPeriodRange("30days");
  const thisMonthLogs = allLogs.filter((log) => {
    const accessedAt = new Date(log.accessed_at);
    return accessedAt >= thisMonthRange.start && accessedAt <= thisMonthRange.end;
  });

  const ranking = buildContentRanking(allLogs);
  const topContent = ranking[0]?.title ?? "—";

  return (
    <AnalyticsDashboard
      logs={allLogs}
      categoryCounts={categoryCounts}
      totalCount={allLogs.length}
      thisMonthCount={thisMonthLogs.length}
      topContent={topContent}
    />
  );
}
