import type { KaraokeActor } from "@/lib/types/database";

export function canRespondToKaraokeSong(
  proposedBy: KaraokeActor,
  actor: KaraokeActor,
): boolean {
  return proposedBy !== actor;
}

export function canEditKaraokeSong(
  proposedBy: KaraokeActor,
  actor: KaraokeActor,
  status: string,
): boolean {
  return proposedBy === actor && status === "pending";
}
