import { NextResponse, type NextRequest } from "next/server";

import {
  DEFAULT_AUTHENTICATED_ROUTE,
  SIGN_IN_ROUTE,
  isApiRoute,
  isPublicRoute,
  shouldRedirectAuthenticatedAway,
} from "@/config/routes";
import {
  CSP_NONCE_HEADER,
  CSP_REPORT_ONLY,
  buildContentSecurityPolicy,
} from "@/config/security";
import { AppErrors, appErrorToHttpStatus } from "@/domain/errors/app-error";
import { updateSupabaseSession } from "@/infrastructure/supabase/middleware-client";

const REDIRECT_PARAM = "redirect";

export async function proxy(request: NextRequest) {
  // Per-request CSP nonce. Both headers go on the REQUEST before the
  // session handler builds its `NextResponse.next({ request })`: Next.js
  // reads the `content-security-policy` request header to stamp the nonce
  // onto its own inline bootstrap scripts, and the layout reads
  // `x-nonce` to nonce the theme script. The browser only ever sees the
  // response header set further down.
  const nonce = crypto.randomUUID();
  const contentSecurityPolicy = buildContentSecurityPolicy(nonce);
  request.headers.set(CSP_NONCE_HEADER, nonce);
  request.headers.set("content-security-policy", contentSecurityPolicy);

  const { response, user } = await updateSupabaseSession(request);
  const { pathname, search } = request.nextUrl;

  if (!user && !isPublicRoute(pathname)) {
    // API clients expect JSON, not an HTML sign-in page. A 307 redirect here
    // would make a `fetch().json()` caller throw and surface as a misleading
    // "network error" instead of an actionable 401.
    if (isApiRoute(pathname)) {
      const error = AppErrors.unauthorized();
      return NextResponse.json(
        { ok: false, error },
        { status: appErrorToHttpStatus(error) },
      );
    }
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

  // Report-only during rollout, enforcing once e2e shows zero violations
  // (see CSP_REPORT_ONLY). Redirect/401 responses above carry no document,
  // so they ship without the header.
  response.headers.set(
    CSP_REPORT_ONLY
      ? "Content-Security-Policy-Report-Only"
      : "Content-Security-Policy",
    contentSecurityPolicy,
  );
  return response;
}

export const config = {
  matcher: [
    // robots.txt/sitemap.xml are crawler metadata served by app router
    // handlers; they must bypass the auth gate or anonymous crawlers (and
    // Lighthouse) receive a sign-in redirect instead of the document.
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|brand/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico|woff|woff2|css|js)$).*)",
  ],
};
