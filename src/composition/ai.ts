/**
 * Composition root for the AI feature. Kept separate from `index.ts` so the
 * server-only child-overview loader is not pulled into the widely-imported
 * `makeUseCases` module. The only place AI infrastructure is wired to ports.
 */

import "server-only";

import type { ChatModelPort } from "@/application/ai/ports/chat-model-port";
import type { RateLimiterPort } from "@/application/ai/ports/rate-limiter-port";
import { AiChatService } from "@/application/ai/ai-chat.service";
import { BuildPageContextUseCase } from "@/application/ai/page-context/build-page-context";
import type { AiToolSet } from "@/application/ai/tools/ai-tool";
import { buildAiTools } from "@/application/ai/tools/build-ai-tools";
import type {
  AiToolContext,
  AiToolSession,
  TrackerToolContext,
} from "@/application/ai/tools/tool-context";
import type { AiPageId } from "@/config/ai";
import { env } from "@/config/env";
import { GoogleChatModel } from "@/infrastructure/ai/google-chat-model";
import { getRateLimiter } from "@/infrastructure/rate-limit/upstash-rate-limiter";
import type { TypedSupabaseClient } from "@/infrastructure/supabase/server-client";
import { loadChildOverview } from "@/lib/child-overview";

import { getContainer, makeUseCases } from "./index";

export interface AiServices {
  readonly rateLimiter: RateLimiterPort;
  /** Null when no Gemini API key is configured (route returns 502). */
  readonly chatModel: ChatModelPort | null;
  readonly aiChat: AiChatService | null;
  readonly buildPageContext: BuildPageContextUseCase;
  buildTools(pageId: AiPageId, session: AiToolSession | null): AiToolSet;
}

/** Wire the per-request AI services from the request-scoped Supabase client. */
export function makeAiServices(client: TypedSupabaseClient): AiServices {
  const useCases = makeUseCases(client);
  const logger = getContainer().logger;

  const rateLimiter = getRateLimiter(logger);
  const chatModel: ChatModelPort | null = env.GEMINI_API_KEY
    ? new GoogleChatModel(env.GEMINI_API_KEY)
    : null;
  const aiChat = chatModel ? new AiChatService(chatModel, logger) : null;

  const buildPageContext = new BuildPageContextUseCase({
    getDashboardInsights: useCases.getDashboardInsights,
    getRegionByKodeBps: useCases.getRegionByKodeBps,
    listRegionIndicatorsHistory: useCases.listRegionIndicatorsHistory,
    getDefaultModelMetadata: useCases.getDefaultModelMetadata,
    listIndicatorDictionary: useCases.listIndicatorDictionary,
    loadChildOverview,
  });

  function buildTools(
    pageId: AiPageId,
    session: AiToolSession | null,
  ): AiToolSet {
    const regionContext: AiToolContext = { useCases, logger };
    const trackerContext: TrackerToolContext | undefined = session
      ? { session, loadChildOverview, logger }
      : undefined;
    return buildAiTools({
      pageId,
      regionContext,
      ...(trackerContext ? { trackerContext } : {}),
    });
  }

  return { rateLimiter, chatModel, aiChat, buildPageContext, buildTools };
}
