"use client";

import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";

import {
  resendVerificationEmail,
  type AuthActionResult,
} from "@/app/(auth)/actions";
import { AuthFeedback } from "@/app/(auth)/_components/auth-feedback";
import { Button } from "@/components/primitives/button";
import { CHECK_EMAIL_LABELS } from "@/config/auth";

interface CheckEmailFormProps {
  readonly email: string;
  readonly redirectTo: string;
}

const RESEND_COOLDOWN_SECONDS = 60;

function ResendButton({ disabled }: { readonly disabled: boolean }) {
  const status = useFormStatus();
  return (
    <Button
      type="submit"
      variant="outline"
      loading={status.pending}
      disabled={disabled || status.pending}
      fullWidth
    >
      {status.pending
        ? CHECK_EMAIL_LABELS.resending
        : CHECK_EMAIL_LABELS.resend}
    </Button>
  );
}

export function CheckEmailForm({ email, redirectTo }: CheckEmailFormProps) {
  const [state, action] = useActionState<AuthActionResult | null, FormData>(
    resendVerificationEmail,
    null,
  );

  // Cooldown timer kicks in on every successful resend so the user can't
  // hammer the action and trip Supabase rate limits. We snap to the new
  // value during render (storing-information-from-previous-renders) so
  // we don't burn a render cycle with a setState-in-effect.
  const [cooldown, setCooldown] = useState(0);
  const [lastSeenState, setLastSeenState] = useState<AuthActionResult | null>(
    state,
  );
  if (state !== lastSeenState) {
    setLastSeenState(state);
    if (state?.ok) setCooldown(RESEND_COOLDOWN_SECONDS);
  }
  useEffect(() => {
    if (cooldown <= 0) return;
    const interval = window.setInterval(() => {
      setCooldown((value) => (value > 0 ? value - 1 : 0));
    }, 1000);
    return () => window.clearInterval(interval);
  }, [cooldown]);

  const generalError =
    state && !state.ok && !state.fieldErrors ? state.message : null;
  const succeeded = state?.ok === true;
  const emailMissing = email.length === 0;

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-border bg-muted/40 p-5">
        <div className="flex items-start gap-3">
          <MailCircleIcon />
          <div className="min-w-0 flex-1 space-y-1">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {CHECK_EMAIL_LABELS.emailSentTo}
            </p>
            <p className="truncate text-sm font-semibold text-foreground">
              {emailMissing ? "—" : email}
            </p>
            <p className="text-xs text-muted-foreground">
              {CHECK_EMAIL_LABELS.expiresHint}
            </p>
          </div>
        </div>
      </div>

      <p className="text-sm text-muted-foreground">{CHECK_EMAIL_LABELS.hint}</p>

      <form action={action} className="space-y-3" noValidate>
        <input type="hidden" name="email" value={email} />
        <input type="hidden" name="redirectTo" value={redirectTo} />
        {generalError ? (
          <AuthFeedback tone="error">{generalError}</AuthFeedback>
        ) : null}
        {succeeded ? (
          <AuthFeedback tone="success">
            {CHECK_EMAIL_LABELS.resentSuccess}
          </AuthFeedback>
        ) : null}
        {cooldown > 0 ? (
          <p className="text-xs font-medium text-muted-foreground">
            {CHECK_EMAIL_LABELS.cooldown(cooldown)}
          </p>
        ) : null}
        <ResendButton disabled={emailMissing || cooldown > 0} />
      </form>
    </div>
  );
}

function MailCircleIcon() {
  return (
    <span
      aria-hidden
      className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-100 text-primary"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-5 w-5"
      >
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="m4 7 8 6 8-6" />
      </svg>
    </span>
  );
}
