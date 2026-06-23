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
import { createDiary, deleteDiary, updateDiary } from "@/lib/actions/admin/diaries";
import { formatDiaryDate, getTodayDateString, truncateText } from "@/lib/format";
import type { Diary } from "@/lib/types/database";

function DiaryForm({
  editing,
  onCancel,
}: {
  editing?: Diary | null;
  onCancel: () => void;
}) {
  return (
    <AdminCard title={editing ? "日記を編集" : "新規日記"}>
      <form action={editing ? updateDiary : createDiary} className="grid gap-5 p-5 md:grid-cols-2">
        {editing ? <input type="hidden" name="id" value={editing.id} /> : null}

        <AdminField label="日付">
          <input
            type="date"
            name="diary_date"
            defaultValue={editing?.diary_date ?? getTodayDateString()}
            className={adminInputClass}
            required
          />
        </AdminField>

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

        <div className="md:col-span-2">
          <AdminField label="本文">
            <textarea
              name="body"
              rows={6}
              defaultValue={editing?.body ?? ""}
              placeholder="今日の近況を書く…"
              className={adminTextareaClass}
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

export function DiaryAdmin({ diaries }: { diaries: Diary[] }) {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Diary | null>(null);

  return (
    <>
      <AdminPageHeader
        title="日記"
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
          <DiaryForm
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
                  {["日付", "タイトル", "本文", ""].map((heading) => (
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
                {diaries.length > 0 ? (
                  diaries.map((diary) => (
                    <tr key={diary.id} className="border-b border-[#F8F8F8] hover:bg-[#FAFAFA]">
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-[#444]">
                        {formatDiaryDate(diary.diary_date)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-[#444]">
                        {diary.title}
                      </td>
                      <td className="max-w-md px-4 py-3 text-sm text-[#888]">
                        {truncateText(diary.body, 60)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setEditing(diary);
                              setShowForm(true);
                            }}
                            className="p-1 text-[#888] hover:text-[#333]"
                            aria-label="編集"
                          >
                            <i className="ti ti-edit" />
                          </button>
                          <form action={deleteDiary}>
                            <input type="hidden" name="id" value={diary.id} />
                            <AdminIconButton icon="ti-trash" danger label="削除" />
                          </form>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-sm text-[#888]">
                      まだ日記がありません。
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
