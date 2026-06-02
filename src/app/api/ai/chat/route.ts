import { type NextRequest } from "next/server";

import type { AiChatErrorResponse } from "@/application/ai/dtos";
import {
  lastUserText,
  referencesScreen,
} from "@/application/ai/screen-reference";
import type { AiToolSession } from "@/application/ai/tools/tool-context";
import { AI_AUTH_REQUIRED_PAGES } from "@/config/ai";
import { env } from "@/config/env";
import { RATE_LIMIT_UNKNOWN_IP } from "@/config/rate-limit";
import { getContainer } from "@/composition";
import { makeAiServices } from "@/composition/ai";
import {
  AppErrors,
  appErrorToHttpStatus,
  type AppError,
} from "@/domain/errors/app-error";
import { redactSelectionForLog } from "@/infrastructure/ai/pii-redaction";
import { createSupabaseServerClient } from "@/infrastructure/supabase/server-client";
import { tryServerSession } from "@/lib/server-session";
import { AiChatRequestSchema } from "@/schemas/ai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// Keep in sync with AI_LIMITS.maxDurationSeconds (Next requires a literal here).
export const maxDuration = 30;

/**
 * Streaming AI chat endpoint. Phase A (validation, auth, rate-limit, context,
 * tool assembly) is fully `Result`-shaped and returns standard error JSON. Once
 * the stream starts (Phase B) the contract becomes the UI message stream
 * protocol; mid-stream errors are handled by the model adapter's `onError`. See
 * ADR-0020.
 *
 * Anonymous callers get a small rate budget; when exhausted the 429 carries
 * `requiresLogin: true` so the client prompts a sign-in.
 */
export async function POST(request: NextRequest): Promise<Response> {
  const startedAt = Date.now();
  const logger = getContainer().logger;

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return errorJson(
      AppErrors.validation("Body harus JSON yang valid."),
      false,
    );
  }

  const parsed = AiChatRequestSchema.safeParse(payload);
  if (!parsed.success) {
    return errorJson(
      AppErrors.validation(
        parsed.error.issues[0]?.message ?? "Input tidak valid.",
      ),
      false,
    );
  }
  const { messages, pageContext } = parsed.data;

  const session = await tryServerSession();
  const toolSession: AiToolSession | null = session
    ? { userId: session.userId }
    : null;
  if (AI_AUTH_REQUIRED_PAGES.includes(pageContext.pageId) && !session) {
    return errorJson(
      AppErrors.unauthorized("Masuk untuk memakai asisten pada halaman ini."),
      true,
    );
  }

  let client;
  try {
    client = await createSupabaseServerClient();
  } catch (cause) {
    return errorJson(
      AppErrors.unexpected(
        "Layanan tidak tersedia.",
        cause instanceof Error ? cause : undefined,
      ),
      false,
    );
  }

  const services = makeAiServices(client);

  const tier = session ? "auth" : "anon";
  const key = session ? session.userId : clientIp(request);
  const decision = await services.rateLimiter.check(key, tier);
  if (!decision.allowed) {
    return errorJson(
      AppErrors.rateLimit(
        "Batas penggunaan tercapai. Coba lagi nanti.",
        decision.retryAfterSeconds,
      ),
      !session,
      { "Retry-After": String(decision.retryAfterSeconds) },
    );
  }

  if (!services.aiChat) {
    return errorJson(
      AppErrors.externalService("Layanan AI belum dikonfigurasi.", "gemini"),
      false,
    );
  }

  // Only attach the captured on-screen text when the user actually points at it
  // (e.g. "rumus ini") — a large token saving on self-contained questions.
  const includeScreenText = referencesScreen(lastUserText(messages));
  const pageContextDto = await services.buildPageContext.execute(
    pageContext,
    toolSession,
    includeScreenText,
  );
  const tools = services.buildTools(pageContext.pageId, toolSession);

  const streamResult = await services.aiChat.startStream({
    pageId: pageContext.pageId,
    pageContext: pageContextDto,
    messages,
    tools,
    abortSignal: request.signal,
  });
  if (!streamResult.ok) {
    return errorJson(streamResult.error, false);
  }

  logger.info("AI chat stream started", {
    route: "/api/ai/chat",
    tier,
    latencyMs: Date.now() - startedAt,
    model: env.GEMINI_MODEL,
    ...redactSelectionForLog(pageContext),
  });

  return streamResult.value.toResponse();
}

function errorJson(
  error: AppError,
  requiresLogin: boolean,
  headers?: Record<string, string>,
): Response {
  const body: AiChatErrorResponse = { ok: false, error, requiresLogin };
  return Response.json(body, {
    status: appErrorToHttpStatus(error),
    ...(headers ? { headers } : {}),
  });
}

/** Best-effort client IP for anon rate-limit keying; fails closed to a shared bucket. */
function clientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const first = forwarded?.split(",")[0]?.trim();
  if (first) return first;
  const real = request.headers.get("x-real-ip")?.trim();
  return real && real.length > 0 ? real : RATE_LIMIT_UNKNOWN_IP;
}
