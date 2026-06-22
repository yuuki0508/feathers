import type { NextRequest, NextResponse } from "next/server";

export const ADMIN_COOKIE = "feathers_admin";

function getAdminSecret(): string {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) {
    throw new Error("ADMIN_SECRET is not configured");
  }
  return secret;
}

async function hmacSha256(secret: string, message: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(message),
  );

  return Array.from(new Uint8Array(signature))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function timingSafeEqualStrings(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let index = 0; index < a.length; index += 1) {
    result |= a.charCodeAt(index) ^ b.charCodeAt(index);
  }
  return result === 0;
}

export async function createAdminToken(userId: string): Promise<string> {
  return hmacSha256(getAdminSecret(), userId);
}

export async function verifyAdminToken(
  userId: string,
  token: string | undefined,
): Promise<boolean> {
  if (!token) return false;
  try {
    const expected = await createAdminToken(userId);
    return timingSafeEqualStrings(expected, token);
  } catch {
    return false;
  }
}

export function readAdminToken(request: NextRequest): string | undefined {
  return request.cookies.get(ADMIN_COOKIE)?.value;
}

export function clearAdminCookie(response: NextResponse): void {
  response.cookies.set(ADMIN_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

export function adminCookieOptions(token: string) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
    value: token,
  };
}
