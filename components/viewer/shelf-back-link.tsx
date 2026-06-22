import Link from "next/link";

export function ShelfBackLink() {
  return (
    <Link
      href="/shelf"
      className="flex items-center gap-1.5 px-5 pt-5 text-xs text-text-sub"
    >
      <i className="ti ti-chevron-left text-base" />
      本棚へ戻る
    </Link>
  );
}
