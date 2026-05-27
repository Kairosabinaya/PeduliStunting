"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import {
  signUpWithPassword,
  type AuthActionResult,
} from "@/app/(auth)/actions";
import { AuthFeedback } from "@/app/(auth)/_components/auth-feedback";
import { AuthSeparator } from "@/app/(auth)/_components/auth-separator";
import { GoogleForm } from "@/app/(auth)/_components/google-form";
import { PasswordInput } from "@/app/(auth)/_components/password-input";
import { Button } from "@/components/primitives/button";
import { Input } from "@/components/primitives/input";
import { Label } from "@/components/primitives/label";
import {
  AUTH_LABELS,
  AUTH_SUCCESS_MESSAGES,
} from "@/config/auth";

interface SignUpFormProps {
  readonly redirectTo?: string | undefined;
}

function SubmitButton() {
  const status = useFormStatus();
  return (
    <Button type="submit" loading={status.pending} fullWidth>
      {AUTH_LABELS.signUpSubmit}
    </Button>
  );
}

function fieldError(
  result: AuthActionResult | null,
  field: string,
): string | undefined {
  return result?.fieldErrors?.[field]?.[0];
}

export function SignUpForm({ redirectTo }: SignUpFormProps) {
  const [state, action] = useActionState<AuthActionResult | null, FormData>(
    signUpWithPassword,
    null,
  );
  const succeeded = state?.ok === true;
  const generalError =
    state && !state.ok && !state.fieldErrors ? state.message : null;

  return (
    <div className="space-y-6">
      <form action={action} className="space-y-4" noValidate>
        <input type="hidden" name="redirectTo" value={redirectTo ?? ""} />
        <div className="space-y-2">
          <Label htmlFor="signup-name" required>
            {AUTH_LABELS.displayName}
          </Label>
          <Input
            id="signup-name"
            name="displayName"
            autoComplete="name"
            required
            placeholder={AUTH_LABELS.displayNamePlaceholder}
            errorMessage={fieldError(state, "displayName")}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="signup-email" required>
            {AUTH_LABELS.email}
          </Label>
          <Input
            id="signup-email"
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            required
            placeholder={AUTH_LABELS.emailPlaceholder}
            errorMessage={fieldError(state, "email")}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="signup-password" required>
            {AUTH_LABELS.password}
          </Label>
          <PasswordInput
            id="signup-password"
            name="password"
            autoComplete="new-password"
            required
            hint={AUTH_LABELS.passwordHint}
            errorMessage={fieldError(state, "password")}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="signup-confirm" required>
            {AUTH_LABELS.confirmPassword}
          </Label>
          <PasswordInput
            id="signup-confirm"
            name="confirmPassword"
            autoComplete="new-password"
            required
            errorMessage={fieldError(state, "confirmPassword")}
          />
        </div>
        {generalError ? (
          <AuthFeedback tone="error">{generalError}</AuthFeedback>
        ) : null}
        {succeeded ? (
          <AuthFeedback tone="success">
            {AUTH_SUCCESS_MESSAGES.signUpVerifyEmail}
          </AuthFeedback>
        ) : null}
        <SubmitButton />
      </form>

      <AuthSeparator label={AUTH_LABELS.separator} />

      <GoogleForm label={AUTH_LABELS.google.signUp} />
    </div>
  );
}
