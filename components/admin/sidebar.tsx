"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/lib/actions/admin/auth";

const NAV_SECTIONS = [
  {
    title: "メイン",
    items: [
      { href: "/admin", label: "今日のひとこと", icon: "ti-sun" },
      { href: "/admin/message", label: "メッセージ・手紙", icon: "ti-mail-heart" },
    ],
  },
  {
    title: "本棚",
    items: [
      { href: "/admin/memory", label: "思い出", icon: "ti-photo-heart" },
      { href: "/admin/likes", label: "好きなところ", icon: "ti-heart" },
      { href: "/admin/diary", label: "日記", icon: "ti-notebook" },
    ],
  },
  {
    title: "コンテンツ",
    items: [{ href: "/admin/novel", label: "お楽しみ（小説）", icon: "ti-book-2" }],
  },
  {
    title: "分析",
    items: [
      { href: "/admin/viewer-activity", label: "彼女のアクション", icon: "ti-bell" },
      { href: "/admin/analytics", label: "アクセス分析", icon: "ti-chart-bar" },
    ],
  },
  {
    title: "設定",
    items: [{ href: "/admin/settings", label: "カテゴリ・タグ管理", icon: "ti-settings" }],
  },
] as const;

type AdminSidebarProps = {
  isOpen?: boolean;
  onClose?: () => void;
};

export function AdminSidebar({ isOpen = false, onClose }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 flex w-[min(280px,85vw)] shrink-0 flex-col bg-[#1E1E2E] transition-transform duration-200 md:static md:z-auto md:w-[220px] md:translate-x-0 ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="flex items-start justify-between border-b border-[#2E2E42] px-5 pb-5 pt-6">
        <div className="min-w-0">
          <p className="text-base font-medium tracking-wide text-white">ココロの羽 — 管理</p>
          <p className="mt-1 text-[11px] text-[#888]">Admin Panel</p>
        </div>
        <button
          type="button"
          aria-label="メニューを閉じる"
          onClick={onClose}
          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[#888] hover:bg-[#2E2E42] hover:text-white md:hidden"
        >
          <i className="ti ti-x text-lg" />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto py-3">
        {NAV_SECTIONS.map((section) => (
          <div key={section.title}>
            <p className="px-5 pb-1.5 pt-4 text-[10px] tracking-[0.12em] text-[#555]">
              {section.title}
            </p>
            {section.items.map((item) => {
              const active =
                item.href === "/admin"
                  ? pathname === "/admin"
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={`flex items-center gap-2.5 border-l-[3px] px-5 py-2.5 text-[13px] ${
                    active
                      ? "border-[#C4866A] bg-[#2E2E42] text-white"
                      : "border-transparent text-[#AAA] hover:bg-[#2E2E42] hover:text-white"
                  }`}
                >
                  <i className={`ti ${item.icon} text-lg`} />
                  {item.label}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <form action={logoutAction}>
        <button
          type="submit"
          className="flex w-full items-center border-t border-[#2E2E42] px-5 py-4 text-xs text-[#555] hover:text-[#aaa]"
        >
          <i className="ti ti-logout mr-1.5 text-sm" />
          ログアウト
        </button>
      </form>
    </aside>
  );
}
