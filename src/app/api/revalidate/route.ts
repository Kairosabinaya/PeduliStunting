import { revalidateTag } from "next/cache";
import { type NextRequest } from "next/server";

import { DATA_CACHE_TAGS } from "@/config/cache-tags";
import { env } from "@/config/env";
import { AppErrors, appErrorToHttpStatus } from "@/domain/errors/app-error";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Refresh all public-data caches after a research re-import. Guarded by the
 * `REVALIDATE_SECRET` header; disabled (401) when the secret is not configured.
 * Call once after `pnpm import:*` (or rely on a redeploy clearing the cache).
 */
export async function POST(request: NextRequest): Promise<Response> {
  const secret = request.headers.get("x-revalidate-secret");
  if (!env.REVALIDATE_SECRET || secret !== env.REVALIDATE_SECRET) {
    const error = AppErrors.unauthorized();
    return Response.json(
      { ok: false, error },
      { status: appErrorToHttpStatus(error) },
    );
  }
  for (const tag of DATA_CACHE_TAGS) {
    revalidateTag(tag, "max");
  }
  return Response.json({ ok: true, revalidated: DATA_CACHE_TAGS });
}
