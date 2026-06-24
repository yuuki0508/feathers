import {
  clearAdminCookie,
  readAdminToken,
  verifyAdminToken,
} from "@/lib/auth/admin-session";
import { isAllowedUser } from "@/lib/auth/emails";
import { updateSession } from "@/lib/supabase/middleware";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const { response, user } = await updateSession(request);
  const { pathname } = request.nextUrl;

  const isViewerLogin = pathname === "/login";
  const isAdminLogin = pathname === "/admin/login";
  const isAdminRoute = pathname.startsWith("/admin");
  const hasAdminAccess =
    !!user && (await verifyAdminToken(user.id, readAdminToken(request)));

  if (!user) {
    if (isViewerLogin || isAdminLogin) {
      return response;
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (!isAllowedUser(user.email)) {
    const denied = NextResponse.redirect(new URL("/login", request.url));
    clearAdminCookie(denied);
    return denied;
  }

  if (isViewerLogin) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (isAdminLogin) {
    if (hasAdminAccess) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    return response;
  }

  if (isAdminRoute) {
    if (hasAdminAccess) {
      return response;
    }
    return NextResponse.redirect(new URL("/", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sw.js|manifest.json|manifest.webmanifest|icon|apple-icon|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
