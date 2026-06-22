export function getAuthEmail(): string {
  return process.env.AUTH_EMAIL ?? process.env.NEXT_PUBLIC_AUTH_EMAIL ?? "kanojo@example.com";
}

/** @deprecated getAuthEmail を使用 */
export function getViewerEmail(): string {
  return getAuthEmail();
}

export function isAllowedUser(email: string | undefined): boolean {
  if (!email) return false;
  return email.toLowerCase() === getAuthEmail().toLowerCase();
}
