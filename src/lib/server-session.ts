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
