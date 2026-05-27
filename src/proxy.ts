import { NextResponse, type NextRequest } from "next/server";

import {
  DEFAULT_AUTHENTICATED_ROUTE,
  SIGN_IN_ROUTE,
  isPublicRoute,
  shouldRedirectAuthenticatedAway,
} from "@/config/routes";
import { updateSupabaseSession } from "@/infrastructure/supabase/middleware-client";

const REDIRECT_PARAM = "redirect";

export async function proxy(request: NextRequest) {
  const { response, user } = await updateSupabaseSession(request);
  const { pathname, search } = request.nextUrl;

  if (!user && !isPublicRoute(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = SIGN_IN_ROUTE;
    url.search = "";
    url.searchParams.set(REDIRECT_PARAM, `${pathname}${search}`);
    return NextResponse.redirect(url);
  }

  if (user && shouldRedirectAuthenticatedAway(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = DEFAULT_AUTHENTICATED_ROUTE;
    url.search = "";
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|brand/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico|woff|woff2|css|js)$).*)",
  ],
};
