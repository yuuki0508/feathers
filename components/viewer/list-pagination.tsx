import Link from "next/link";
import { buildListPageHref } from "@/lib/pagination";

type ListPaginationProps = {
  basePath: string;
  page: number;
  totalPages: number;
  extraParams?: Record<string, string | undefined>;
};

export function ListPagination({
  basePath,
  page,
  totalPages,
  extraParams,
}: ListPaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <nav
      className="mt-6 flex items-center justify-center gap-4 pb-2"
      aria-label="ページ送り"
    >
      {page > 1 ? (
        <Link
          href={buildListPageHref(basePath, page - 1, extraParams)}
          className="text-sm text-accent"
        >
          ← 前へ
        </Link>
      ) : (
        <span className="text-sm text-text-muted">← 前へ</span>
      )}
      <span className="text-xs tracking-wide text-text-sub">
        {page} / {totalPages}
      </span>
      {page < totalPages ? (
        <Link
          href={buildListPageHref(basePath, page + 1, extraParams)}
          className="text-sm text-accent"
        >
          次へ →
        </Link>
      ) : (
        <span className="text-sm text-text-muted">次へ →</span>
      )}
    </nav>
  );
}
