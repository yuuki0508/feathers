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
} from "@/components/admin/ui";
import {
  createCategory,
  createTag,
  deleteCategory,
  deleteTag,
  updateCategory,
  updateTag,
} from "@/lib/actions/admin/settings";
import type { CategoryWithCount, TagWithCount } from "@/lib/types/database";

function SettingsList({
  title,
  description,
  items,
  createAction,
  updateAction,
  deleteAction,
  placeholder,
}: {
  title: string;
  description: string;
  items: Array<{ id: string; name: string; count: number }>;
  createAction: (formData: FormData) => Promise<void>;
  updateAction: (formData: FormData) => Promise<void>;
  deleteAction: (formData: FormData) => Promise<void>;
  placeholder: string;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);

  return (
    <AdminCard title={title} description={description}>
      <div className="flex flex-col gap-2 p-4 sm:p-5">
        {items.map((item) =>
          editingId === item.id ? (
            <form
              key={item.id}
              action={updateAction}
              className="flex flex-col gap-2 rounded-lg border border-[#F0F0F0] bg-[#FAFAFA] px-3.5 py-2.5 sm:flex-row sm:items-center"
            >
              <input type="hidden" name="id" value={item.id} />
              <input
                name="name"
                defaultValue={item.name}
                className={`${adminInputClass} flex-1`}
                required
              />
              <AdminPrimaryButton type="submit">保存</AdminPrimaryButton>
              <AdminGhostButton type="button" onClick={() => setEditingId(null)}>
                取消
              </AdminGhostButton>
            </form>
          ) : (
            <div
              key={item.id}
              className="flex flex-wrap items-center gap-2 rounded-lg border border-[#F0F0F0] bg-[#FAFAFA] px-3.5 py-2.5"
            >
              <span className="flex-1 text-sm text-[#333]">{item.name}</span>
              <span className="mr-2 text-xs text-[#aaa]">{item.count}件</span>
              <button
                type="button"
                onClick={() => setEditingId(item.id)}
                className="p-1 text-[#888] hover:text-[#333]"
                aria-label="編集"
              >
                <i className="ti ti-edit" />
              </button>
              <form action={deleteAction}>
                <input type="hidden" name="id" value={item.id} />
                <AdminIconButton icon="ti-trash" danger label="削除" />
              </form>
            </div>
          ),
        )}
      </div>

      <form action={createAction} className="flex flex-col gap-2 px-4 pb-5 sm:flex-row sm:px-5">
        <input
          name="name"
          type="text"
          placeholder={placeholder}
          className={`${adminInputClass} flex-1`}
          required
        />
        <AdminPrimaryButton type="submit">
          <i className="ti ti-plus" />
          追加
        </AdminPrimaryButton>
      </form>
    </AdminCard>
  );
}

export function SettingsAdmin({
  categories,
  tags,
}: {
  categories: CategoryWithCount[];
  tags: TagWithCount[];
}) {
  return (
    <>
      <AdminPageHeader title="カテゴリ・タグ管理" />
      <AdminPageContent>
        <SettingsList
          title="カテゴリ"
          description="彼女の手紙画面で絞り込みに使われます"
          items={categories}
          createAction={createCategory}
          updateAction={updateCategory}
          deleteAction={deleteCategory}
          placeholder="新しいカテゴリ名を入力…"
        />

        <SettingsList
          title="タグ"
          description="管理用・将来の検索用。現在は彼女の画面には表示されません"
          items={tags}
          createAction={createTag}
          updateAction={updateTag}
          deleteAction={deleteTag}
          placeholder="新しいタグ名を入力…"
        />
      </AdminPageContent>
    </>
  );
}
