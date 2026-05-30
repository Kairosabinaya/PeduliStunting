"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { updatePassword, type AuthActionResult } from "@/app/(auth)/actions";
import { FeedbackBanner } from "@/components/primitives/feedback-banner";
import { LockIcon } from "@/app/(auth)/_components/field-icons";
import { MotionStack } from "@/app/(auth)/_components/motion-stack";
import { PasswordInput } from "@/app/(auth)/_components/password-input";
import { Button } from "@/components/primitives/button";
import { Label } from "@/components/primitives/label";
import { AUTH_LABELS, AUTH_SUCCESS_MESSAGES } from "@/config/auth";

function SubmitButton() {
  const status = useFormStatus();
  return (
    <Button type="submit" loading={status.pending} fullWidth>
      {AUTH_LABELS.updateSubmit}
    </Button>
  );
}

function fieldError(
  result: AuthActionResult | null,
  field: string,
): string | undefined {
  return result?.fieldErrors?.[field]?.[0];
}

export function UpdatePasswordForm() {
  const [state, action] = useActionState<AuthActionResult | null, FormData>(
    updatePassword,
    null,
  );
  const generalError =
    state && !state.ok && !state.fieldErrors ? state.message : null;
  const succeeded = state?.ok === true;

  return (
    <form action={action} noValidate>
      <MotionStack stagger={0.05} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="update-password" required>
            {AUTH_LABELS.password}
          </Label>
          <PasswordInput
            id="update-password"
            name="password"
            autoComplete="new-password"
            required
            hint={AUTH_LABELS.passwordHint}
            errorMessage={fieldError(state, "password")}
            leftIcon={<LockIcon />}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="update-confirm" required>
            {AUTH_LABELS.confirmPassword}
          </Label>
          <PasswordInput
            id="update-confirm"
            name="confirmPassword"
            autoComplete="new-password"
            required
            errorMessage={fieldError(state, "confirmPassword")}
            leftIcon={<LockIcon />}
          />
        </div>
        {generalError ? (
          <FeedbackBanner tone="error">{generalError}</FeedbackBanner>
        ) : null}
        {succeeded ? (
          <FeedbackBanner tone="success">
            {AUTH_SUCCESS_MESSAGES.passwordUpdated}
          </FeedbackBanner>
        ) : null}
        <SubmitButton />
      </MotionStack>
    </form>
  );
}
