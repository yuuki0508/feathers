"use server";

import { createClient } from "@/lib/supabase/server";

type AccessLogInput = {
  pageType: string;
  contentId?: string | null;
  contentTitle?: string | null;
};

export async function recordAccessLog(input: AccessLogInput) {
  const supabase = await createClient();
  await supabase.from("access_logs").insert({
    page_type: input.pageType,
    content_id: input.contentId ?? null,
    content_title: input.contentTitle ?? null,
  });
}
