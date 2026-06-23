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
  AdminTag,
  adminInputClass,
} from "@/components/admin/ui";
import { createMessage, deleteMessage, updateMessage } from "@/lib/actions/admin/messages";
import { AdminTextareaWithCount } from "@/components/admin/textarea-with-count";
import { formatShortDate, getTodayDateString, toDateInputValue } from "@/lib/format";
import type { Category, MessageWithTags, Tag } from "@/lib/types/database";

type MessageFormProps = {
  categories: Category[];
  tags: Tag[];
  editing?: MessageWithTags | null;
  onCancel: () => void;
};

function MessageForm({ categories, tags, editing, onCancel }: MessageFormProps) {
  const selectedTagIds = editing?.message_tags.map((entry) => entry.tag_id) ?? [];

  return (
    <AdminCard title={editing ? "メッセージを編集" : "新規メッセージ"}>
      <form
        action={editing ? updateMessage : createMessage}
        className="grid gap-5 p-5 md:grid-cols-2"
      >
        {editing ? <input type="hidden" name="id" value={editing.id} /> : null}

        <AdminField label="日付">
          <input
            type="date"
            name="posted_date"
            defaultValue={
              editing ? toDateInputValue(editing.created_at) : getTodayDateString()
            }
            className={adminInputClass}
            required
          />
        </AdminField>

        <AdminField label="カテゴリ" hint="※彼女の画面に表示">
          <select
            name="category_id"
            defaultValue={editing?.category_id ?? categories[0]?.id ?? ""}
            className={adminInputClass}
            required
          >
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </AdminField>

        <div className="md:col-span-2">
          <AdminField label="タグ" hint="※管理用・将来の検索用">
            <select
              name="tag_ids"
              multiple
              defaultValue={selectedTagIds}
              className={`${adminInputClass} h-24`}
            >
              {tags.map((tag) => (
                <option key={tag.id} value={tag.id}>
                  {tag.name}
                </option>
              ))}
            </select>
          </AdminField>
        </div>

        <div className="md:col-span-2">
          <AdminField label="本文">
            <AdminTextareaWithCount
              name="body"
              rows={8}
              defaultValue={editing?.body ?? ""}
              placeholder="メッセージを入力…"
              className="min-h-52 md:min-h-0"
              required
            />
          </AdminField>
        </div>

        <div className="flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-end md:col-span-2">
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

export function MessageAdmin({
  categories,
  tags,
  messages,
}: {
  categories: Category[];
  tags: Tag[];
  messages: MessageWithTags[];
}) {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<MessageWithTags | null>(null);

  const openCreate = () => {
    setEditing(null);
    setShowForm(true);
  };

  const openEdit = (message: MessageWithTags) => {
    setEditing(message);
    setShowForm(true);
  };

  const closeForm = () => {
    setEditing(null);
    setShowForm(false);
  };

  return (
    <>
      <AdminPageHeader
        title="メッセージ・手紙"
        action={
          <AdminPrimaryButton type="button" onClick={openCreate}>
            <i className="ti ti-plus" />
            新規追加
          </AdminPrimaryButton>
        }
      />

      <AdminPageContent>
        {showForm ? (
          <MessageForm
            key={editing?.id ?? "create"}
            categories={categories}
            tags={tags}
            editing={editing}
            onCancel={closeForm}
          />
        ) : null}

        <AdminCard title="投稿一覧">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-[#F0F0F0] bg-[#FAFAFA]">
                  {["カテゴリ", "タグ", "本文", "投稿日", ""].map((heading) => (
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
                {messages.length > 0 ? (
                  messages.map((message) => (
                    <tr
                      key={message.id}
                      className="border-b border-[#F8F8F8] hover:bg-[#FAFAFA]"
                    >
                      <td className="px-4 py-3 align-middle">
                        {message.categories?.name ? (
                          <AdminTag>{message.categories.name}</AdminTag>
                        ) : null}
                      </td>
                      <td className="px-4 py-3 align-middle">
                        {message.message_tags.map((entry) =>
                          entry.tags?.name ? (
                            <AdminTag key={entry.tag_id} muted>
                              {entry.tags.name}
                            </AdminTag>
                          ) : null,
                        )}
                      </td>
                      <td className="max-w-md px-4 py-3 align-middle text-sm leading-relaxed text-[#444]">
                        <p className="line-clamp-3 whitespace-pre-wrap">{message.body}</p>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 align-middle text-sm text-[#444]">
                        {formatShortDate(message.created_at)}
                      </td>
                      <td className="px-4 py-3 align-middle">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => openEdit(message)}
                            className="p-1 text-[#888] hover:text-[#333]"
                            aria-label="編集"
                          >
                            <i className="ti ti-edit" />
                          </button>
                          <form action={deleteMessage}>
                            <input type="hidden" name="id" value={message.id} />
                            <AdminIconButton icon="ti-trash" danger label="削除" />
                          </form>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-sm text-[#888]">
                      まだ投稿がありません。
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
