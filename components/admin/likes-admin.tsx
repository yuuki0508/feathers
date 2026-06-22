"use client";

import { useState } from "react";
import {
  AdminCard,
  AdminField,
  AdminGhostButton,
  AdminIconButton,
  AdminPageHeader,
  AdminPrimaryButton,
  adminInputClass,
} from "@/components/admin/ui";
import { createLike, deleteLike } from "@/lib/actions/admin/likes";
import { formatLikeNumber } from "@/lib/format";
import type { Like } from "@/lib/types/database";

export function LikesAdmin({ likes }: { likes: Like[] }) {
  const [showForm, setShowForm] = useState(false);

  return (
    <>
      <AdminPageHeader
        title="好きなところ"
        action={
          <AdminPrimaryButton type="button" onClick={() => setShowForm(true)}>
            <i className="ti ti-plus" />
            追加
          </AdminPrimaryButton>
        }
      />

      <div className="p-7">
        {showForm ? (
          <AdminCard title="新規追加">
            <form action={createLike} className="p-5">
              <AdminField label="好きなところ">
                <input
                  name="body"
                  type="text"
                  placeholder="一言で入力…"
                  className={adminInputClass}
                  required
                />
              </AdminField>
              <div className="mt-4 flex justify-end gap-2.5">
                <AdminGhostButton type="button" onClick={() => setShowForm(false)}>
                  キャンセル
                </AdminGhostButton>
                <AdminPrimaryButton type="submit">
                  <i className="ti ti-check" />
                  保存
                </AdminPrimaryButton>
              </div>
            </form>
          </AdminCard>
        ) : null}

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
                      <td className="px-4 py-3 text-sm text-[#444]">{like.body}</td>
                      <td className="px-4 py-3">
                        <form action={deleteLike}>
                          <input type="hidden" name="id" value={like.id} />
                          <AdminIconButton icon="ti-trash" danger label="削除" />
                        </form>
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
