"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import {
  requestPasswordReset,
  type AuthActionResult,
} from "@/app/(auth)/actions";
import { AuthFeedback } from "@/app/(auth)/_components/auth-feedback";
import { Button } from "@/components/primitives/button";
import { Input } from "@/components/primitives/input";
import { Label } from "@/components/primitives/label";
import { AUTH_LABELS, AUTH_SUCCESS_MESSAGES } from "@/config/auth";

function SubmitButton() {
  const status = useFormStatus();
  return (
    <Button type="submit" loading={status.pending} fullWidth>
      {AUTH_LABELS.resetSubmit}
    </Button>
  );
}

function fieldError(
  result: AuthActionResult | null,
  field: string,
): string | undefined {
  return result?.fieldErrors?.[field]?.[0];
}

export function ResetPasswordForm() {
  const [state, action] = useActionState<AuthActionResult | null, FormData>(
    requestPasswordReset,
    null,
  );
  const succeeded = state?.ok === true;
  const generalError =
    state && !state.ok && !state.fieldErrors ? state.message : null;

  return (
    <form action={action} className="space-y-4" noValidate>
      <div className="space-y-2">
        <Label htmlFor="reset-email" required>
          {AUTH_LABELS.email}
        </Label>
        <Input
          id="reset-email"
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          required
          placeholder={AUTH_LABELS.emailPlaceholder}
          errorMessage={fieldError(state, "email")}
        />
      </div>
      {generalError ? (
        <AuthFeedback tone="error">{generalError}</AuthFeedback>
      ) : null}
      {succeeded ? (
        <AuthFeedback tone="success">
          {AUTH_SUCCESS_MESSAGES.resetLinkSent}
        </AuthFeedback>
      ) : null}
      <SubmitButton />
    </form>
  );
}
