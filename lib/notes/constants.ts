export const NOTE_MAX_LENGTH = 500;
export const NOTE_MAX_PHOTOS = 4;
export const NOTES_BUCKET = "notes";

export function validateNoteContent(
  body: string,
  photoCount: number,
  label = "NOTE",
): string | null {
  const trimmed = body.trim();
  if (trimmed.length === 0 && photoCount === 0) {
    return `${label}または写真を入力してください`;
  }
  if (trimmed.length > NOTE_MAX_LENGTH) {
    return `${NOTE_MAX_LENGTH}字以内で入力してください`;
  }
  if (photoCount > NOTE_MAX_PHOTOS) {
    return `写真は${NOTE_MAX_PHOTOS}枚までです`;
  }
  return null;
}

export function getNoteAuthorLabel(authorType: "admin" | "viewer"): "Y" | "N" {
  return authorType === "admin" ? "Y" : "N";
}
