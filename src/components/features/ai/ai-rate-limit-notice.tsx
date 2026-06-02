"use client";

import Link from "next/link";

import { buttonVariants } from "@/components/primitives";
import { AI_COPY } from "@/config/ai-copy";
import { SIGN_IN_ROUTE } from "@/config/routes";
import { cn } from "@/lib/cn";

/**
 * Shown when the caller is rate-limited. Anonymous callers get a sign-in CTA;
 * authenticated callers get a retry hint.
 */
export function AiRateLimitNotice({
  requiresLogin,
  retryAfterSeconds,
}: {
  readonly requiresLogin: boolean;
  readonly retryAfterSeconds?: number;
}) {
  if (requiresLogin) {
    return (
      <div className="rounded-xl border border-border bg-surface p-5 text-center">
        <p className="text-sm font-semibold text-foreground">
          {AI_COPY.rateLimitAnonTitle}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          {AI_COPY.rateLimitAnonDescription}
        </p>
        <Link
          href={SIGN_IN_ROUTE}
          className={cn(
            buttonVariants({ variant: "primary", size: "sm" }),
            "mt-3",
          )}
        >
          {AI_COPY.rateLimitAnonCta}
        </Link>
      </div>
    );
  }
  return (
    <div className="rounded-xl border border-border bg-surface p-5 text-center">
      <p className="text-sm font-semibold text-foreground">
        {AI_COPY.rateLimitAuthTitle}
      </p>
      <p className="mt-1 text-xs text-muted-foreground">
        {retryAfterSeconds && retryAfterSeconds > 0
          ? `Coba lagi dalam ${retryAfterSeconds} detik.`
          : AI_COPY.rateLimitAuthDescription}
      </p>
    </div>
  );
}
