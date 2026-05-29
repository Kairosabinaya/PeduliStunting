import "server-only";

import { redirect } from "next/navigation";

import { SIGN_IN_ROUTE } from "@/config/routes";
import { asUserId, type UserId } from "@/domain/shared/ids";
import { createSupabaseServerClient } from "@/infrastructure/supabase/server-client";

export interface ServerSession {
  readonly userId: UserId;
  readonly email: string | null;
}

/**
 * Resolve the current authenticated user from the request's Supabase cookies.
 * Use this from Server Components and Server Actions inside the `(app)`
 * group. Redirects to sign-in when no session is present so callers can
 * assume a non-null user (defense in depth against the proxy gate).
 */
export async function requireServerSession(): Promise<ServerSession> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) {
    redirect(SIGN_IN_ROUTE);
  }
  return {
    userId: asUserId(data.user.id),
    email: data.user.email ?? null,
  };
}

/**
 * Like {@link requireServerSession} but returns `null` instead of redirecting
 * when the visitor is unauthenticated. Use this from auth-conditional public
 * routes (currently only `/map`) where both signed-in and signed-out branches
 * are first-class. Swallows Supabase configuration errors so a misconfigured
 * deploy still serves the landing experience instead of a 500.
 */
export async function tryServerSession(): Promise<ServerSession | null> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) return null;
    return {
      userId: asUserId(data.user.id),
      email: data.user.email ?? null,
    };
  } catch {
    return null;
  }
}
