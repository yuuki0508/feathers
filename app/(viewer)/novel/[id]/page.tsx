import { notFound } from "next/navigation";
import { AccessLogTracker } from "@/components/viewer/access-log-tracker";
import { NovelBackLink } from "@/components/viewer/novel-back-link";
import { NovelReadTracker } from "@/components/viewer/novel-read-tracker";
import { createClient } from "@/lib/supabase/server";
import type { Novel } from "@/lib/types/database";

type NovelDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function NovelDetailPage({ params }: NovelDetailPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: novel } = await supabase
    .from("novels")
    .select("*")
    .eq("id", id)
    .maybeSingle<Novel>();

  if (!novel) {
    notFound();
  }

  return (
    <>
      <AccessLogTracker
        pageType="お楽しみ"
        contentId={novel.id}
        contentTitle={novel.title}
      />
      <NovelReadTracker novelId={novel.id} />
      <NovelBackLink />
      <article className="px-5 pb-8 pt-6">
        <h1 className="mb-6 font-display text-xl leading-snug text-accent">
          {novel.title}
        </h1>
        <div className="whitespace-pre-wrap text-sm leading-[2] text-text">
          {novel.body}
        </div>
      </article>
    </>
  );
}
