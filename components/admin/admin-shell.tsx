"use client";

import { useState } from "react";
import { AdminSidebar } from "@/components/admin/sidebar";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#F5F5F5] text-[#333]">
      {menuOpen ? (
        <button
          type="button"
          aria-label="メニューを閉じる"
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setMenuOpen(false)}
        />
      ) : null}

      <AdminSidebar isOpen={menuOpen} onClose={() => setMenuOpen(false)} />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-[#E5E5E5] bg-white px-4 py-3 md:hidden">
          <button
            type="button"
            aria-label="メニューを開く"
            onClick={() => setMenuOpen(true)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-[#333] hover:bg-[#F5F5F5]"
          >
            <i className="ti ti-menu-2 text-xl" />
          </button>
          <p className="truncate text-sm font-medium text-[#333]">ココロの羽 — 管理</p>
        </header>

        <main className="flex-1 overflow-x-hidden overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
