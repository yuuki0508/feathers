import { AccessLogTracker } from "@/components/viewer/access-log-tracker";
import { ShelfBackLink } from "@/components/viewer/shelf-back-link";
import { SubHeader } from "@/components/viewer/sub-header";
import { formatLikeNumber } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import type { Like } from "@/lib/types/database";

export default async function LikesPage() {
  const supabase = await createClient();
  const { data: likes } = await supabase
    .from("likes")
    .select("*")
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: true })
    .returns<Like[]>();

  return (
    <>
      <AccessLogTracker pageType="好きなところ" />
      <ShelfBackLink />
      <SubHeader title="好きなところ" subtitle="ここにしか咲かない花、またひとつ" />
      <div className="px-5">
        {likes && likes.length > 0 ? (
          likes.map((like, index) => (
            <article
              key={like.id}
              className="mb-2.5 flex items-baseline gap-3 rounded-[18px] border border-border bg-card px-5 py-[18px]"
            >
              <span className="min-w-7 font-display text-xl text-accent-light">
                {formatLikeNumber(index)}
              </span>
              <p className="text-sm leading-[1.7] text-text">{like.body}</p>
            </article>
          ))
        ) : (
          <p className="rounded-[18px] border border-border bg-card px-5 py-8 text-center text-sm text-text-sub">
            まだ登録がありません。
          </p>
        )}
      </div>
    </>
  );
}
