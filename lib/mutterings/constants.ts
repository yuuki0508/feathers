export const MUTTERING_MAX_LENGTH = 300;

export function validateMutteringBody(body: string): string | null {
  const trimmed = body.trim();
  if (trimmed.length === 0) {
    return "つぶやきを入力してください";
  }
  if (trimmed.length > MUTTERING_MAX_LENGTH) {
    return `${MUTTERING_MAX_LENGTH}字以内で入力してください`;
  }
  return null;
}

export function getReplyAuthorLabel(authorType: "admin" | "viewer"): "Y" | "N" {
  return authorType === "admin" ? "Y" : "N";
}
