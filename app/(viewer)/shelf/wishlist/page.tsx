import { AccessLogTracker } from "@/components/viewer/access-log-tracker";
import { ShelfBackLink } from "@/components/viewer/shelf-back-link";
import { SubHeader } from "@/components/viewer/sub-header";
import { WishlistContent } from "@/components/viewer/wishlist-content";
import { createClient } from "@/lib/supabase/server";
import type { WishlistItem } from "@/lib/types/database";

export default async function WishlistPage() {
  const supabase = await createClient();
  const { data: items } = await supabase
    .from("wishlist_items")
    .select("*")
    .order("is_done", { ascending: true })
    .order("created_at", { ascending: true })
    .returns<WishlistItem[]>();

  return (
    <>
      <AccessLogTracker pageType="やりたいこと" />
      <ShelfBackLink />
      <SubHeader title="やりたいこと" subtitle="いつか叶えたい未来" />
      <div className="px-5 pb-6">
        <WishlistContent items={items ?? []} />
      </div>
    </>
  );
}
