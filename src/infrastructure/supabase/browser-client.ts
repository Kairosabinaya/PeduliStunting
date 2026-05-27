"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { env, hasSupabaseConfig } from "@/config/env";

let cached: SupabaseClient | undefined;

/**
 * Returns a singleton Supabase client for client components.
 *
 * Throws if Supabase credentials are missing. Stage 3 client surfaces will
 * guard with {@link hasSupabaseConfig} so the app builds before Stage 2.
 */
export function getSupabaseBrowserClient(): SupabaseClient {
  if (!hasSupabaseConfig()) {
    throw new Error(
      "Supabase env vars are not set. See .env.example for required keys.",
    );
  }
  if (!cached) {
    cached = createBrowserClient(
      env.NEXT_PUBLIC_SUPABASE_URL ?? "",
      env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
    );
  }
  return cached;
}
