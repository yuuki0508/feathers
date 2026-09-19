import { AccessLogTracker } from "@/components/viewer/access-log-tracker";
import { ListPagination } from "@/components/viewer/list-pagination";
import { NotesContent } from "@/components/viewer/notes-content";
import { ShelfBackLink } from "@/components/viewer/shelf-back-link";
import { SubHeader } from "@/components/viewer/sub-header";
import { getSessionActor } from "@/lib/auth/session-actor";
import {
  clampPage,
  getPageRange,
  getTotalPages,
  parsePageParam,
} from "@/lib/pagination";
import { NOTES_BUCKET } from "@/lib/notes/constants";
import { getSignedPhotoUrls } from "@/lib/storage";
import { createClient } from "@/lib/supabase/server";
import type { Note, NoteReply, NoteReplyWithPhotos, NoteWithPhotos } from "@/lib/types/database";
import { redirect } from "next/navigation";

type NotesPageProps = {
  searchParams: Promise<{ page?: string }>;
};

export default async function NotesPage({ searchParams }: NotesPageProps) {
  const actor = await getSessionActor();
  if (!actor) {
    redirect("/login");
  }

  const params = await searchParams;
  const requestedPage = parsePageParam(params.page);

  const supabase = await createClient();
  const { count } = await supabase.from("notes").select("*", { count: "exact", head: true });

  const totalPages = getTotalPages(count ?? 0);
  const page = clampPage(requestedPage, totalPages);
  const { from, to } = getPageRange(page);

  const { data: notes } = await supabase
    .from("notes")
    .select("*")
    .order("created_at", { ascending: false })
    .range(from, to)
    .returns<Note[]>();

  const noteIds = (notes ?? []).map((item) => item.id);
  let replies: NoteReply[] = [];

  if (noteIds.length > 0) {
    const { data } = await supabase
      .from("note_replies")
      .select("*")
      .in("note_id", noteIds)
      .order("created_at", { ascending: true })
      .returns<NoteReply[]>();
    replies = data ?? [];
  }

  const notesWithPhotos: NoteWithPhotos[] = await Promise.all(
    (notes ?? []).map(async (note) => ({
      ...note,
      photo_paths: note.photo_paths ?? [],
      photoUrls: await getSignedPhotoUrls(supabase, note.photo_paths, NOTES_BUCKET),
    })),
  );

  const repliesWithPhotos: NoteReplyWithPhotos[] = await Promise.all(
    replies.map(async (reply) => ({
      ...reply,
      photo_paths: reply.photo_paths ?? [],
      photoUrls: await getSignedPhotoUrls(supabase, reply.photo_paths, NOTES_BUCKET),
    })),
  );

  const repliesByNoteId = repliesWithPhotos.reduce<Record<string, NoteReplyWithPhotos[]>>(
    (accumulator, reply) => {
      const list = accumulator[reply.note_id] ?? [];
      list.push(reply);
      accumulator[reply.note_id] = list;
      return accumulator;
    },
    {},
  );

  return (
    <>
      <AccessLogTracker pageType="NOTE" />
      <ShelfBackLink />
      <SubHeader title="NOTE" subtitle="君に話ながら歩いてゆく" />
      <div className="px-5 pb-6">
        <NotesContent notes={notesWithPhotos} repliesByNoteId={repliesByNoteId} actor={actor} />
        <ListPagination basePath="/shelf/notes" page={page} totalPages={totalPages} />
      </div>
    </>
  );
}
