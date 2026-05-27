"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import {
  signInWithPassword,
  type AuthActionResult,
} from "@/app/(auth)/actions";
import { AuthFeedback } from "@/app/(auth)/_components/auth-feedback";
import { AuthSeparator } from "@/app/(auth)/_components/auth-separator";
import { GoogleForm } from "@/app/(auth)/_components/google-form";
import { PasswordInput } from "@/app/(auth)/_components/password-input";
import { Button } from "@/components/primitives/button";
import { Input } from "@/components/primitives/input";
import { Label } from "@/components/primitives/label";
import { AUTH_LABELS, getAuthErrorMessage } from "@/config/auth";
import { RESET_PASSWORD_ROUTE } from "@/config/routes";

interface SignInFormProps {
  readonly redirectTo?: string | undefined;
  readonly errorCode?: string | undefined;
}

function SubmitButton() {
  const status = useFormStatus();
  return (
    <Button type="submit" loading={status.pending} fullWidth>
      {AUTH_LABELS.signInSubmit}
    </Button>
  );
}

function fieldError(
  result: AuthActionResult | null,
  field: string,
): string | undefined {
  return result?.fieldErrors?.[field]?.[0];
}

export function SignInForm({ redirectTo, errorCode }: SignInFormProps) {
  const [state, action] = useActionState<AuthActionResult | null, FormData>(
    signInWithPassword,
    null,
  );
  const querystringError = getAuthErrorMessage(errorCode);
  const generalError =
    state && !state.ok && !state.fieldErrors ? state.message : null;
  const banner = generalError ?? querystringError;

  return (
    <div className="space-y-6">
      <form action={action} className="space-y-4" noValidate>
        <input type="hidden" name="redirectTo" value={redirectTo ?? ""} />
        <div className="space-y-2">
          <Label htmlFor="signin-email" required>
            {AUTH_LABELS.email}
          </Label>
          <Input
            id="signin-email"
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
          <div className="flex items-center justify-between gap-2">
            <Label htmlFor="signin-password" required>
              {AUTH_LABELS.password}
            </Label>
            <Link
              href={RESET_PASSWORD_ROUTE}
              className="text-xs font-medium text-primary hover:underline focus-visible:outline-none focus-visible:underline"
            >
              {AUTH_LABELS.forgotPassword}
            </Link>
          </div>
          <PasswordInput
            id="signin-password"
            name="password"
            autoComplete="current-password"
            required
            errorMessage={fieldError(state, "password")}
          />
        </div>
        {banner ? <AuthFeedback tone="error">{banner}</AuthFeedback> : null}
        <SubmitButton />
      </form>

      <AuthSeparator label={AUTH_LABELS.separator} />

      <GoogleForm label={AUTH_LABELS.google.signIn} />
    </div>
  );
}
