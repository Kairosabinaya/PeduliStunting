import "server-only";
import { createServerClient, type CookieMethodsServer } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { env, hasSupabaseConfig } from "@/config/env";
import type { Database } from "@/types/supabase";

export type TypedSupabaseClient = SupabaseClient<Database>;

/**
 * Returns a Supabase client bound to the current request's cookie jar.
 * Use this in Server Components, Server Actions, and Route Handlers.
 *
 * Throws if Supabase credentials are not configured. Stage 1 callers should
 * check {@link hasSupabaseConfig} first; later stages will assume presence.
 */
export async function createSupabaseServerClient(): Promise<TypedSupabaseClient> {
  if (!hasSupabaseConfig()) {
    throw new Error(
      "Supabase env vars are not set. See .env.example for required keys.",
    );
  }
  const cookieStore = await cookies();
  const cookieMethods: CookieMethodsServer = {
    getAll() {
      return cookieStore.getAll();
    },
    setAll(cookiesToSet) {
      try {
        for (const { name, value, options } of cookiesToSet) {
          cookieStore.set(name, value, options);
        }
      } catch {
        // Reading-only contexts (e.g. RSC during streaming) will refuse
        // cookie mutation; Supabase will still work because the session is
        // refreshed by middleware before the request reaches the component.
      }
    },
  };
  const url = env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const anonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
  return createServerClient<Database>(url, anonKey, { cookies: cookieMethods });
}

/**
 * Cookieless anon client suitable for reads outside the request scope, such
 * as inside `unstable_cache` callbacks where Next.js does not expose cookies.
 * Only safe for PUB-R tables (RLS allows anonymous SELECT) — never use this
 * for user-owned data because it cannot resolve the current session.
 */
export function createSupabasePublicClient(): TypedSupabaseClient {
  if (!hasSupabaseConfig()) {
    throw new Error(
      "Supabase env vars are not set. See .env.example for required keys.",
    );
  }
  const url = env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const anonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
  return createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return [];
      },
      setAll() {
        // no-op: public client must not write user-session cookies
      },
    },
  });
}

/**
 * Server-only admin client backed by the service role key. NEVER import this
 * from a route, page, or component. Reserve for `scripts/` and clearly
 * isolated admin use cases that justify bypassing RLS.
 */
export function createSupabaseAdminClient(): TypedSupabaseClient {
  if (!env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY missing. Required for admin client.",
    );
  }
  if (!env.NEXT_PUBLIC_SUPABASE_URL) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL missing. Required for admin client.",
    );
  }
  return createServerClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY,
    {
      cookies: {
        getAll() {
          return [];
        },
        setAll() {
          // no-op: admin client must not write user-session cookies
        },
      },
    },
  );
}
