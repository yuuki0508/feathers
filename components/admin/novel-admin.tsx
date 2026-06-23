"use client";

import { useState } from "react";
import {
  AdminCard,
  AdminField,
  AdminGhostButton,
  AdminIconButton,
  AdminPageHeader,
  AdminPageContent,
  AdminPrimaryButton,
  adminInputClass,
  adminTextareaClass,
} from "@/components/admin/ui";
import { createNovel, deleteNovel, updateNovel } from "@/lib/actions/admin/novels";
import { formatShortDate } from "@/lib/format";
import type { Novel } from "@/lib/types/database";

function NovelForm({
  editing,
  onCancel,
}: {
  editing?: Novel | null;
  onCancel: () => void;
}) {
  return (
    <AdminCard title={editing ? "作品を編集" : "新規作品"}>
      <form action={editing ? updateNovel : createNovel} className="grid gap-5 p-5">
        {editing ? <input type="hidden" name="id" value={editing.id} /> : null}

        <AdminField label="タイトル">
          <input
            type="text"
            name="title"
            defaultValue={editing?.title ?? ""}
            placeholder="タイトルを入力…"
            className={adminInputClass}
            required
          />
        </AdminField>

        <AdminField label="本文">
          <textarea
            name="body"
            rows={10}
            defaultValue={editing?.body ?? ""}
            placeholder="物語を書く…"
            className={adminTextareaClass}
            required
          />
        </AdminField>

        <div className="flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-end">
          <AdminGhostButton type="button" onClick={onCancel}>
            キャンセル
          </AdminGhostButton>
          <AdminPrimaryButton type="submit">
            <i className="ti ti-check" />
            保存
          </AdminPrimaryButton>
        </div>
      </form>
    </AdminCard>
  );
}

export function NovelAdmin({ novels }: { novels: Novel[] }) {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Novel | null>(null);

  return (
    <>
      <AdminPageHeader
        title="お楽しみ（小説）"
        action={
          <AdminPrimaryButton
            type="button"
            onClick={() => {
              setEditing(null);
              setShowForm(true);
            }}
          >
            <i className="ti ti-plus" />
            新規追加
          </AdminPrimaryButton>
        }
      />

      <AdminPageContent>
        {showForm ? (
          <NovelForm
            editing={editing}
            onCancel={() => {
              setEditing(null);
              setShowForm(false);
            }}
          />
        ) : null}

        <AdminCard title="一覧">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-[#F0F0F0] bg-[#FAFAFA]">
                  {["タイトル", "投稿日", ""].map((heading) => (
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
                {novels.length > 0 ? (
                  novels.map((novel) => (
                    <tr key={novel.id} className="border-b border-[#F8F8F8] hover:bg-[#FAFAFA]">
                      <td className="px-4 py-3 text-sm text-[#444]">{novel.title}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-[#444]">
                        {formatShortDate(novel.created_at)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setEditing(novel);
                              setShowForm(true);
                            }}
                            className="p-1 text-[#888] hover:text-[#333]"
                            aria-label="編集"
                          >
                            <i className="ti ti-edit" />
                          </button>
                          <form action={deleteNovel}>
                            <input type="hidden" name="id" value={novel.id} />
                            <AdminIconButton icon="ti-trash" danger label="削除" />
                          </form>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="px-4 py-8 text-center text-sm text-[#888]">
                      まだ作品がありません。
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </AdminCard>
      </AdminPageContent>
    </>
  );
}
