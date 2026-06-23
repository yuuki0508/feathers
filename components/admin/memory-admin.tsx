"use client";

import {
  useActionState,
  useState,
  startTransition,
  type FormEvent,
} from "react";
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
import {
  deleteMemory,
  saveMemoryAction,
  type MemoryFormState,
} from "@/lib/actions/admin/memories";
import { compressFormImageField } from "@/lib/client/compress-image";
import { formatFullDate, getTodayDateString } from "@/lib/format";
import type { Memory } from "@/lib/types/database";

function MemoryForm({
  editing,
  onCancel,
}: {
  editing?: Memory | null;
  onCancel: () => void;
}) {
  const [state, formAction, pending] = useActionState<MemoryFormState, FormData>(
    saveMemoryAction,
    { error: null },
  );
  const [clientError, setClientError] = useState<string | null>(null);
  const [compressing, setCompressing] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setClientError(null);
    setCompressing(true);

    try {
      const formData = new FormData(event.currentTarget);
      await compressFormImageField(formData, "photo", "写真1");
      await compressFormImageField(formData, "photo_2", "写真2");

      startTransition(() => {
        formAction(formData);
      });
    } catch (error) {
      setClientError(
        error instanceof Error ? error.message : "画像の処理に失敗しました",
      );
    } finally {
      setCompressing(false);
    }
  };

  const errorMessage = clientError ?? state.error;
  const isBusy = compressing || pending;

  return (
    <AdminCard title={editing ? "思い出を編集" : "新規思い出"}>
      <form
        onSubmit={handleSubmit}
        encType="multipart/form-data"
        className="grid gap-5 p-5 md:grid-cols-2"
      >
        {editing ? <input type="hidden" name="id" value={editing.id} /> : null}

        <AdminField label="日付">
          <input
            type="date"
            name="memory_date"
            defaultValue={editing?.memory_date ?? getTodayDateString()}
            className={adminInputClass}
            required
          />
        </AdminField>

        <AdminField label="写真1" hint="※最大2枚・アップロード前に自動圧縮">
          <input type="file" name="photo" accept="image/*" className={adminInputClass} />
        </AdminField>

        <AdminField label="写真2" hint="※任意">
          <input type="file" name="photo_2" accept="image/*" className={adminInputClass} />
        </AdminField>

        {editing?.photo_url || editing?.photo_url_2 ? (
          <p className="text-xs text-[#999] md:col-span-2">
            編集時、写真を選び直さない場合は現在の画像がそのまま残ります。
          </p>
        ) : null}

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

        {errorMessage ? (
          <p className="text-sm text-[#C4866A] md:col-span-2">{errorMessage}</p>
        ) : null}

        <div className="flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-end md:col-span-2">
          <AdminGhostButton type="button" onClick={onCancel}>
            キャンセル
          </AdminGhostButton>
          <AdminPrimaryButton type="submit">
            <i className="ti ti-check" />
            {isBusy ? "..." : "保存"}
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

      <AdminPageContent>
        {showForm ? (
          <MemoryForm
            key={editing?.id ?? "create"}
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
      </AdminPageContent>
    </>
  );
}
