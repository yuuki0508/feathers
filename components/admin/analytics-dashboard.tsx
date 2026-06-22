"use client";

import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Tooltip,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { useMemo, useState } from "react";
import {
  AdminCard,
  AdminPageHeader,
  AdminTag,
  adminInputClass,
} from "@/components/admin/ui";
import {
  buildContentRanking,
  buildDailyLogs,
  buildHourlyCounts,
  filterLogs,
  formatLogDate,
  formatLogTime,
  getPeriodRange,
  type AnalyticsPeriod,
  type PageTypeFilter,
} from "@/lib/analytics";
import type { AccessLog } from "@/lib/types/database";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend, ArcElement);

type AnalyticsDashboardProps = {
  logs: AccessLog[];
  categoryCounts: Array<{ name: string; count: number }>;
  totalCount: number;
  thisMonthCount: number;
  topContent: string;
};

export function AnalyticsDashboard({
  logs,
  categoryCounts,
  totalCount,
  thisMonthCount,
  topContent,
}: AnalyticsDashboardProps) {
  const [period, setPeriod] = useState<AnalyticsPeriod>("30days");
  const [pageType, setPageType] = useState<PageTypeFilter>("all");
  const [openDates, setOpenDates] = useState<string[]>([]);

  const filteredLogs = useMemo(
    () => filterLogs(logs, period, pageType),
    [logs, period, pageType],
  );

  const hourlyCounts = useMemo(() => buildHourlyCounts(filteredLogs), [filteredLogs]);
  const ranking = useMemo(() => buildContentRanking(filteredLogs), [filteredLogs]);
  const dailyLogs = useMemo(() => buildDailyLogs(filteredLogs), [filteredLogs]);
  const maxCategoryCount = Math.max(...categoryCounts.map((item) => item.count), 1);
  const maxRankingCount = Math.max(...ranking.map((item) => item.count), 1);

  const toggleDate = (date: string) => {
    setOpenDates((current) =>
      current.includes(date) ? current.filter((value) => value !== date) : [...current, date],
    );
  };

  return (
    <>
      <AdminPageHeader title="アクセス分析" />
      <div className="p-7">
        <div className="mb-6 grid grid-cols-1 gap-3.5 md:grid-cols-3">
          <AdminCard title="">
            <div className="p-4">
              <p className="mb-1.5 text-[11px] tracking-wide text-[#999]">総アクセス数</p>
              <p className="text-[26px] font-medium text-[#333]">{totalCount}</p>
            </div>
          </AdminCard>
          <AdminCard title="">
            <div className="p-4">
              <p className="mb-1.5 text-[11px] tracking-wide text-[#999]">今月のアクセス</p>
              <p className="text-[26px] font-medium text-[#333]">{thisMonthCount}</p>
              <p className="mt-1 text-[11px] text-[#aaa]">直近30日間</p>
            </div>
          </AdminCard>
          <AdminCard title="">
            <div className="p-4">
              <p className="mb-1.5 text-[11px] tracking-wide text-[#999]">最もよく読まれた</p>
              <p className="mt-1 text-[15px] font-medium leading-snug text-[#333]">
                {topContent}
              </p>
            </div>
          </AdminCard>
        </div>

        <div className="mb-6 grid grid-cols-1 gap-4 xl:grid-cols-2">
          <AdminCard title="カテゴリ別閲覧数">
            <div className="space-y-2.5 p-5">
              {categoryCounts.length > 0 ? (
                categoryCounts.map((item) => (
                  <div key={item.name} className="flex items-center gap-2.5">
                    <div className="w-24 shrink-0 text-right text-xs text-[#555]">
                      {item.name}
                    </div>
                    <div className="h-5 flex-1 rounded bg-[#F5F5F5]">
                      <div
                        className="h-5 rounded bg-[#C4866A]"
                        style={{
                          width: `${Math.round((item.count / maxCategoryCount) * 100)}%`,
                          opacity: 0.55 + (item.count / maxCategoryCount) * 0.45,
                        }}
                      />
                    </div>
                    <div className="w-9 text-xs text-[#888]">{item.count}</div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-[#888]">手紙の閲覧データがまだありません。</p>
              )}
            </div>
          </AdminCard>

          <AdminCard title="時間帯別アクセス">
            <div className="h-44 p-5">
              <Bar
                data={{
                  labels: Array.from({ length: 24 }, (_, hour) => String(hour)),
                  datasets: [
                    {
                      data: hourlyCounts,
                      backgroundColor: "#C4866A",
                      borderRadius: 3,
                      borderSkipped: false,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { display: false } },
                  scales: {
                    x: {
                      ticks: { font: { size: 10 }, color: "#aaa" },
                      grid: { display: false },
                    },
                    y: {
                      ticks: { font: { size: 10 }, color: "#aaa" },
                      grid: { color: "#F5F5F5" },
                    },
                  },
                }}
              />
            </div>
          </AdminCard>
        </div>

        <AdminCard title="コンテンツ別閲覧ランキング">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-[#F0F0F0] bg-[#FAFAFA]">
                  {["#", "コンテンツ", "種別", "閲覧数", ""].map((heading) => (
                    <th
                      key={heading}
                      className="px-4 py-2.5 text-left text-[11px] tracking-wide text-[#888]"
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ranking.length > 0 ? (
                  ranking.map((item, index) => (
                    <tr key={`${item.pageType}-${item.title}`} className="border-b border-[#F8F8F8]">
                      <td className="px-4 py-3 font-medium text-[#C4866A]">{index + 1}</td>
                      <td className="max-w-md px-4 py-3 text-sm text-[#444]">{item.title}</td>
                      <td className="px-4 py-3">
                        <AdminTag muted={item.pageType !== "手紙"}>{item.pageType}</AdminTag>
                      </td>
                      <td className="px-4 py-3 text-sm text-[#444]">{item.count}</td>
                      <td className="px-4 py-3">
                        <div className="h-1.5 w-20 rounded bg-[#F0F0F0]">
                          <div
                            className="h-1.5 rounded bg-[#C4866A]"
                            style={{
                              width: `${Math.round((item.count / maxRankingCount) * 100)}%`,
                            }}
                          />
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-sm text-[#888]">
                      該当する閲覧データがありません。
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </AdminCard>

        <AdminCard
          title="日別アクセスログ"
          action={
            <div className="flex gap-2">
              <select
                value={pageType}
                onChange={(event) => setPageType(event.target.value as PageTypeFilter)}
                className={`${adminInputClass} !w-auto py-1.5 text-xs`}
              >
                <option value="all">すべてのページ</option>
                <option value="手紙">手紙</option>
                <option value="思い出">思い出</option>
                <option value="日記">日記</option>
                <option value="お楽しみ">お楽しみ</option>
                <option value="好きなところ">好きなところ</option>
                <option value="ホーム">ホーム</option>
              </select>
              <select
                value={period}
                onChange={(event) => setPeriod(event.target.value as AnalyticsPeriod)}
                className={`${adminInputClass} !w-auto py-1.5 text-xs`}
              >
                <option value="30days">直近30日</option>
                <option value="7days">直近7日</option>
                <option value="thisMonth">今月</option>
                <option value="lastMonth">先月</option>
              </select>
            </div>
          }
        >
          <div>
            {dailyLogs.length > 0 ? (
              dailyLogs.map((day) => {
                const isOpen = openDates.includes(day.date);

                return (
                  <div key={day.date} className="border-b border-[#F5F5F5]">
                    <button
                      type="button"
                      onClick={() => toggleDate(day.date)}
                      className="flex w-full items-center gap-2.5 bg-[#FAFAFA] px-5 py-2.5 text-left"
                    >
                      <i
                        className="ti ti-chevron-right text-sm text-[#ccc]"
                        style={{
                          transform: isOpen ? "rotate(90deg)" : "rotate(0deg)",
                          transition: "transform 0.2s",
                        }}
                      />
                      <span className="min-w-[100px] text-xs font-medium text-[#555]">
                        {formatLogDate(day.date)}
                      </span>
                      <span className="mr-2 text-[11px] text-[#aaa]">
                        {day.entries.length}件
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {day.pageTypes.map((type) => (
                          <AdminTag key={type} muted={type !== "手紙"}>
                            {type}
                          </AdminTag>
                        ))}
                      </div>
                    </button>

                    {isOpen ? (
                      <div className="flex flex-col gap-1.5 px-5 py-2 pb-3 pl-11">
                        {day.entries.map((entry) => (
                          <div key={entry.id} className="flex items-center gap-3">
                            <span className="min-w-[42px] text-[11px] text-[#aaa]">
                              {formatLogTime(entry.accessed_at)}
                            </span>
                            <span className="text-sm text-[#444]">
                              {entry.content_title ?? entry.page_type}
                            </span>
                            <AdminTag muted={entry.page_type !== "手紙"}>
                              {entry.page_type}
                            </AdminTag>
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </div>
                );
              })
            ) : (
              <p className="px-5 py-8 text-center text-sm text-[#888]">
                該当するアクセスログがありません。
              </p>
            )}
          </div>
        </AdminCard>
      </div>
    </>
  );
}
