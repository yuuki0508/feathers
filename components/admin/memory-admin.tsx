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
  adminTextareaClass,
} from "@/components/admin/ui";
import {
  createMemory,
  deleteMemory,
  updateMemory,
} from "@/lib/actions/admin/memories";
import { formatFullDate } from "@/lib/format";
import type { Memory } from "@/lib/types/database";

function MemoryForm({
  editing,
  onCancel,
}: {
  editing?: Memory | null;
  onCancel: () => void;
}) {
  return (
    <AdminCard title={editing ? "思い出を編集" : "新規思い出"}>
      <form
        action={editing ? updateMemory : createMemory}
        encType="multipart/form-data"
        className="grid gap-5 p-5 md:grid-cols-2"
      >
        {editing ? <input type="hidden" name="id" value={editing.id} /> : null}

        <AdminField label="日付">
          <input
            type="date"
            name="memory_date"
            defaultValue={editing?.memory_date ?? ""}
            className={adminInputClass}
          />
        </AdminField>

        <AdminField label="写真">
          <input type="file" name="photo" accept="image/*" className={adminInputClass} />
        </AdminField>

        <div className="md:col-span-2">
          <AdminField label="一言">
            <textarea
              name="caption"
              rows={3}
              defaultValue={editing?.caption ?? ""}
              placeholder="この思い出についての一言…"
              className={adminTextareaClass}
              required
            />
          </AdminField>
        </div>

        <div className="flex justify-end gap-2.5 md:col-span-2">
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

export function MemoryAdmin({ memories }: { memories: Memory[] }) {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Memory | null>(null);

  return (
    <>
      <AdminPageHeader
        title="思い出"
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

      <div className="p-7">
        {showForm ? (
          <MemoryForm
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
                  {["日付", "一言", ""].map((heading) => (
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
                {memories.length > 0 ? (
                  memories.map((memory) => (
                    <tr key={memory.id} className="border-b border-[#F8F8F8] hover:bg-[#FAFAFA]">
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-[#444]">
                        {memory.memory_date ? formatFullDate(memory.memory_date) : "—"}
                      </td>
                      <td className="px-4 py-3 text-sm text-[#444]">{memory.caption}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setEditing(memory);
                              setShowForm(true);
                            }}
                            className="p-1 text-[#888] hover:text-[#333]"
                            aria-label="編集"
                          >
                            <i className="ti ti-edit" />
                          </button>
                          <form action={deleteMemory}>
                            <input type="hidden" name="id" value={memory.id} />
                            <AdminIconButton icon="ti-trash" danger label="削除" />
                          </form>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="px-4 py-8 text-center text-sm text-[#888]">
                      まだ思い出がありません。
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
