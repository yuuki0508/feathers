"use server";

import { ADMIN_COOKIE, verifyAdminToken } from "@/lib/auth/admin-session";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

type AccessLogInput = {
  pageType: string;
  contentId?: string | null;
  contentTitle?: string | null;
};

export async function recordAccessLog(input: AccessLogInput) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const adminToken = (await cookies()).get(ADMIN_COOKIE)?.value;
    if (await verifyAdminToken(user.id, adminToken)) {
      return;
    }
  }

  await supabase.from("access_logs").insert({
    page_type: input.pageType,
    content_id: input.contentId ?? null,
    content_title: input.contentTitle ?? null,
  });
}
