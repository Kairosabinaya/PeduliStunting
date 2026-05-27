import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { User } from "@supabase/supabase-js";

import { env, hasSupabaseConfig } from "@/config/env";

export interface SessionContext {
  readonly response: NextResponse;
  readonly user: User | null;
}

/**
 * Updates the Supabase session on every protected request and returns a
 * mutable {@link NextResponse} that carries any refreshed cookies, alongside
 * the current authenticated user (or `null`).
 *
 * Mounted from `proxy.ts`. When Supabase is not yet configured (Stage 1),
 * it is a passthrough so the app boots without backend wiring.
 */
export async function updateSupabaseSession(
  request: NextRequest,
): Promise<SessionContext> {
  const response = NextResponse.next({ request });
  if (!hasSupabaseConfig()) {
    return { response, user: null };
  }
  const supabase = createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL ?? "",
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options);
          }
        },
      },
    },
  );
  const { data } = await supabase.auth.getUser();
  return { response, user: data.user };
}
