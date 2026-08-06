import { formatFeedDateTime } from "@/lib/format";
import type { KaraokeSong, Muttering, MutteringReply } from "@/lib/types/database";

export type ViewerActivityType =
  | "muttering_post"
  | "muttering_reply"
  | "karaoke_candidate"
  | "karaoke_approved"
  | "karaoke_rejected";

export type ViewerActivityItem = {
  id: string;
  type: ViewerActivityType;
  occurredAt: string;
  primaryText: string;
  secondaryText?: string;
  href: string;
};

const ACTIVITY_LABEL: Record<ViewerActivityType, string> = {
  muttering_post: "つぶやき",
  muttering_reply: "つぶやき返信",
  karaoke_candidate: "カラオケ候補",
  karaoke_approved: "カラオケ採用",
  karaoke_rejected: "カラオケ見送り",
};

type MutteringReplyWithParent = MutteringReply & {
  mutterings: Pick<Muttering, "body"> | null;
};

function wasUpdatedAfterCreate(createdAt: string, updatedAt: string): boolean {
  return new Date(updatedAt).getTime() - new Date(createdAt).getTime() > 1000;
}

export function getViewerActivityLabel(type: ViewerActivityType): string {
  return ACTIVITY_LABEL[type];
}

export function buildViewerActivityItems(input: {
  mutterings: Muttering[];
  mutteringReplies: MutteringReplyWithParent[];
  karaokeSongs: KaraokeSong[];
}): ViewerActivityItem[] {
  const items: ViewerActivityItem[] = [];

  for (const muttering of input.mutterings) {
    items.push({
      id: `muttering:${muttering.id}`,
      type: "muttering_post",
      occurredAt: muttering.created_at,
      primaryText: muttering.body,
      href: "/shelf/mutterings",
    });
  }

  for (const reply of input.mutteringReplies) {
    items.push({
      id: `reply:${reply.id}`,
      type: "muttering_reply",
      occurredAt: reply.created_at,
      primaryText: reply.body,
      secondaryText: reply.mutterings?.body
        ? `元のつぶやき: ${reply.mutterings.body}`
        : undefined,
      href: "/shelf/mutterings",
    });
  }

  for (const song of input.karaokeSongs) {
    if (song.proposed_by === "viewer") {
      items.push({
        id: `karaoke:add:${song.id}`,
        type: "karaoke_candidate",
        occurredAt: song.created_at,
        primaryText: song.title,
        href: "/shelf/karaoke",
      });
    }

    if (
      song.proposed_by === "admin" &&
      song.status === "approved" &&
      wasUpdatedAfterCreate(song.created_at, song.updated_at)
    ) {
      items.push({
        id: `karaoke:approved:${song.id}`,
        type: "karaoke_approved",
        occurredAt: song.updated_at,
        primaryText: song.title,
        href: "/shelf/karaoke",
      });
    }

    if (
      song.proposed_by === "admin" &&
      song.status === "rejected" &&
      wasUpdatedAfterCreate(song.created_at, song.updated_at)
    ) {
      items.push({
        id: `karaoke:rejected:${song.id}`,
        type: "karaoke_rejected",
        occurredAt: song.updated_at,
        primaryText: song.title,
        href: "/shelf/karaoke",
      });
    }
  }

  return items.sort(
    (a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime(),
  );
}

export function paginateViewerActivityItems(
  items: ViewerActivityItem[],
  page: number,
  pageSize: number,
): { items: ViewerActivityItem[]; totalPages: number } {
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * pageSize;

  return {
    items: items.slice(start, start + pageSize),
    totalPages,
  };
}

export function formatViewerActivityDateTime(dateStr: string): string {
  return formatFeedDateTime(dateStr);
}
