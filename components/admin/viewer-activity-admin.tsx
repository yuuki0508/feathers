import Link from "next/link";
import {
  AdminCard,
  AdminPageContent,
  AdminPageHeader,
  AdminTag,
} from "@/components/admin/ui";
import {
  buildListPageHref,
} from "@/lib/pagination";
import {
  formatViewerActivityDateTime,
  getViewerActivityLabel,
  type ViewerActivityItem,
} from "@/lib/admin/viewer-activity";

type ViewerActivityAdminProps = {
  items: ViewerActivityItem[];
  page: number;
  totalPages: number;
};

function ActivityTag({ item }: { item: ViewerActivityItem }) {
  const muted =
    item.type === "karaoke_rejected" ||
    item.type === "muttering_reply";

  return <AdminTag muted={muted}>{getViewerActivityLabel(item.type)}</AdminTag>;
}

export function ViewerActivityAdmin({ items, page, totalPages }: ViewerActivityAdminProps) {
  return (
    <>
      <AdminPageHeader title="彼女のアクション" />
      <AdminPageContent>
        <AdminCard
          title="つぶやき・カラオケの反応"
          description="彼女側（非管理者）の投稿・返信・候補追加、およびカラオケへの採用/見送り"
        >
          {items.length > 0 ? (
            <ul className="divide-y divide-[#F0F0F0]">
              {items.map((item) => (
                <li key={item.id} className="px-4 py-4 sm:px-5">
                  <div className="flex flex-wrap items-center gap-2">
                    <ActivityTag item={item} />
                    <span className="text-[11px] text-[#999]">
                      {formatViewerActivityDateTime(item.occurredAt)}
                    </span>
                  </div>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-[#333]">
                    {item.primaryText}
                  </p>
                  {item.secondaryText ? (
                    <p className="mt-2 whitespace-pre-wrap text-xs leading-relaxed text-[#888]">
                      {item.secondaryText}
                    </p>
                  ) : null}
                  <Link
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-block text-xs text-[#C4866A] hover:underline"
                  >
                    閲覧画面で見る →
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-5 py-10 text-center text-sm text-[#999]">
              まだ彼女のアクションはありません。
            </p>
          )}
        </AdminCard>

        {totalPages > 1 ? (
          <nav
            className="flex items-center justify-center gap-4 pb-2"
            aria-label="ページ送り"
          >
            {page > 1 ? (
              <Link
                href={buildListPageHref("/admin/viewer-activity", page - 1)}
                className="text-sm text-[#C4866A]"
              >
                ← 前へ
              </Link>
            ) : (
              <span className="text-sm text-[#CCC]">← 前へ</span>
            )}
            <span className="text-xs tracking-wide text-[#999]">
              {page} / {totalPages}
            </span>
            {page < totalPages ? (
              <Link
                href={buildListPageHref("/admin/viewer-activity", page + 1)}
                className="text-sm text-[#C4866A]"
              >
                次へ →
              </Link>
            ) : (
              <span className="text-sm text-[#CCC]">次へ →</span>
            )}
          </nav>
        ) : null}
      </AdminPageContent>
    </>
  );
}
