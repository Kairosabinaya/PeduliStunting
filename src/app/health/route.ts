import { NextResponse } from "next/server";
import { env, hasSupabaseConfig } from "@/config/env";

export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json({
    status: "ok",
    supabaseConfigured: hasSupabaseConfig(),
    buildSha: env.VERCEL_GIT_COMMIT_SHA ?? "local",
    timestamp: new Date().toISOString(),
  });
}
