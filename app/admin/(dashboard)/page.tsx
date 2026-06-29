import {
  AdminCard,
  AdminField,
  AdminPageHeader,
  AdminPageContent,
  AdminPrimaryButton,
  adminTextareaClass,
} from "@/components/admin/ui";
import { updateTodayMessage } from "@/lib/actions/admin/today";
import { formatFullDate, getTodayDateString } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import type { TodayMessage } from "@/lib/types/database";

export default async function AdminTodayPage() {
  const supabase = await createClient();
  const today = getTodayDateString();
  const { data: todayMessage } = await supabase
    .from("today_message")
    .select("*")
    .eq("display_date", today)
    .maybeSingle<TodayMessage>();

  const displayDate = formatFullDate(today);

  return (
    <>
      <AdminPageHeader title="今日のひとこと" />
      <AdminPageContent>
        <AdminCard title="現在の表示">
          <div className="p-5">
            <p className="mb-1.5 text-[11px] text-[#C4866A]">{displayDate}</p>
            <div className="mb-5 whitespace-pre-wrap rounded-lg bg-[#FBF0E8] p-4 text-sm leading-relaxed text-[#5C4A3D]">
              {todayMessage?.body ?? "まだ設定されていません。"}
            </div>

            <form action={updateTodayMessage}>
              <AdminField label="今日のメッセージを更新">
                <textarea
                  name="body"
                  rows={3}
                  defaultValue={todayMessage?.body ?? ""}
                  placeholder="今日のひとことを入力…"
                  className={`${adminTextareaClass} min-h-52 md:min-h-0`}
                />
              </AdminField>
              <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <AdminPrimaryButton type="submit">
                  <i className="ti ti-check" />
                  更新する
                </AdminPrimaryButton>
              </div>
            </form>
          </div>
        </AdminCard>
      </AdminPageContent>
    </>
  );
}
