import Link from "next/link";

export function NovelBackLink() {
  return (
    <Link
      href="/novel"
      className="flex items-center gap-1.5 px-5 pt-5 text-xs text-text-sub"
    >
      <i className="ti ti-chevron-left text-base" />
      一覧へ戻る
    </Link>
  );
}
