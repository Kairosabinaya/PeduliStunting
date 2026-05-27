import { NextResponse, type NextRequest } from "next/server";

import {
  DEFAULT_AUTHENTICATED_ROUTE,
  SIGN_IN_ROUTE,
  UPDATE_PASSWORD_ROUTE,
} from "@/config/routes";
import { createSupabaseServerClient } from "@/infrastructure/supabase/server-client";

/**
 * OAuth and magic-link callback handler. Exchanges the `?code` from the
 * provider for a Supabase session cookie and then redirects to the page the
 * user was originally heading to (falls back to the default route).
 *
 * The recovery (reset-password) flow routes through here as well; when the
 * token is invalid or expired we surface `?error=reset_token_invalid` on
 * sign-in so the friendly translation in `getAuthErrorMessage` kicks in.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? DEFAULT_AUTHENTICATED_ROUTE;
  const isRecovery = next === UPDATE_PASSWORD_ROUTE;

  if (!code) {
    const url = new URL(SIGN_IN_ROUTE, origin);
    url.searchParams.set(
      "error",
      isRecovery ? "reset_token_invalid" : "callback_failed",
    );
    return NextResponse.redirect(url);
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    const url = new URL(SIGN_IN_ROUTE, origin);
    url.searchParams.set(
      "error",
      isRecovery ? "reset_token_invalid" : "callback_failed",
    );
    return NextResponse.redirect(url);
  }

  const target =
    next.startsWith("/") && !next.startsWith("//")
      ? next
      : DEFAULT_AUTHENTICATED_ROUTE;
  return NextResponse.redirect(new URL(target, origin));
}
