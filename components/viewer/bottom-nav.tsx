"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/", label: "ホーム", icon: "ti-home", match: (path: string) => path === "/" },
  {
    href: "/letter",
    label: "手紙",
    icon: "ti-mail-heart",
    match: (path: string) => path.startsWith("/letter"),
  },
  {
    href: "/shelf",
    label: "本棚",
    icon: "ti-books",
    match: (path: string) => path.startsWith("/shelf"),
  },
  {
    href: "/novel",
    label: "お楽しみ",
    icon: "ti-book-2",
    match: (path: string) => path.startsWith("/novel"),
  },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-1/2 z-50 flex w-full max-w-[390px] -translate-x-1/2 justify-around border-t border-border bg-card px-2 pb-[18px] pt-2.5">
      {NAV_ITEMS.map(({ href, label, icon, match }) => {
        const active = match(pathname);
        return (
          <Link
            key={href}
            href={href}
            className={`flex flex-col items-center gap-0.5 text-[10px] tracking-wide ${
              active ? "text-accent" : "text-text-sub"
            }`}
          >
            <i className={`ti ${icon} text-2xl ${active ? "text-accent" : "text-text-sub"}`} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
