"use client";

import { useState } from "react";
import {
  AdminCard,
  AdminField,
  AdminGhostButton,
  AdminIconButton,
  AdminPageHeader,
  AdminPrimaryButton,
  adminTextareaClass,
} from "@/components/admin/ui";
import { createLike, deleteLike, updateLike } from "@/lib/actions/admin/likes";
import { formatLikeNumber } from "@/lib/format";
import type { Like } from "@/lib/types/database";

function LikeForm({
  editing,
  onCancel,
}: {
  editing?: Like | null;
  onCancel: () => void;
}) {
  return (
    <AdminCard title={editing ? "好きなところを編集" : "新規追加"}>
      <form action={editing ? updateLike : createLike} className="p-5">
        {editing ? <input type="hidden" name="id" value={editing.id} /> : null}

        <AdminField label="好きなところ">
          <textarea
            name="body"
            rows={4}
            defaultValue={editing?.body ?? ""}
            placeholder="入力…"
            className={adminTextareaClass}
            required
          />
        </AdminField>

        <div className="mt-4 flex justify-end gap-2.5">
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

export function LikesAdmin({ likes }: { likes: Like[] }) {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Like | null>(null);

  const openCreate = () => {
    setEditing(null);
    setShowForm(true);
  };

  const openEdit = (like: Like) => {
    setEditing(like);
    setShowForm(true);
  };

  const closeForm = () => {
    setEditing(null);
    setShowForm(false);
  };

  return (
    <>
      <AdminPageHeader
        title="好きなところ"
        action={
          <AdminPrimaryButton type="button" onClick={openCreate}>
            <i className="ti ti-plus" />
            追加
          </AdminPrimaryButton>
        }
      />

      <div className="p-7">
        {showForm ? <LikeForm editing={editing} onCancel={closeForm} /> : null}

        <AdminCard title="一覧">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-[#F0F0F0] bg-[#FAFAFA]">
                  {["#", "内容", ""].map((heading) => (
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
                {likes.length > 0 ? (
                  likes.map((like, index) => (
                    <tr key={like.id} className="border-b border-[#F8F8F8] hover:bg-[#FAFAFA]">
                      <td className="px-4 py-3 font-medium text-[#E8C5A0]">
                        {formatLikeNumber(index)}
                      </td>
                      <td className="px-4 py-3 text-sm text-[#444]">
                        <p className="line-clamp-3 whitespace-pre-wrap">{like.body}</p>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => openEdit(like)}
                            className="p-1 text-[#888] hover:text-[#333]"
                            aria-label="編集"
                          >
                            <i className="ti ti-edit" />
                          </button>
                          <form action={deleteLike}>
                            <input type="hidden" name="id" value={like.id} />
                            <AdminIconButton icon="ti-trash" danger label="削除" />
                          </form>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="px-4 py-8 text-center text-sm text-[#888]">
                      まだ登録がありません。
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </AdminCard>
      </div>
    </>
  );
}
