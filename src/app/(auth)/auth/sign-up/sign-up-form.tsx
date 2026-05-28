"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";

import {
  signUpWithPassword,
  type AuthActionResult,
} from "@/app/(auth)/actions";
import { AuthFeedback } from "@/app/(auth)/_components/auth-feedback";
import { AuthSeparator } from "@/app/(auth)/_components/auth-separator";
import { AvatarUploader } from "@/app/(auth)/_components/avatar-uploader";
import {
  LockIcon,
  MailIcon,
  UserIcon,
} from "@/app/(auth)/_components/field-icons";
import { GoogleForm } from "@/app/(auth)/_components/google-form";
import { MotionStack } from "@/app/(auth)/_components/motion-stack";
import { PasswordInput } from "@/app/(auth)/_components/password-input";
import { PasswordStrength } from "@/app/(auth)/_components/password-strength";
import { Button } from "@/components/primitives/button";
import { Input } from "@/components/primitives/input";
import { Label } from "@/components/primitives/label";
import { AUTH_LABELS, AUTH_SUCCESS_MESSAGES } from "@/config/auth";

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
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");

  const succeeded = state?.ok === true;
  const generalError =
    state && !state.ok && !state.fieldErrors ? state.message : null;
  // Live mismatch hint kicks in only after the confirm field has had
  // any characters typed, so the user is not nagged on first focus.
  const liveMismatch =
    confirmPassword.length > 0 &&
    password.length > 0 &&
    password !== confirmPassword
      ? "Konfirmasi kata sandi tidak sama."
      : undefined;

  return (
    <div className="space-y-6">
      <form action={action} className="space-y-5" noValidate>
        <input type="hidden" name="redirectTo" value={redirectTo ?? ""} />

        <div className="grid gap-5 lg:grid-cols-[200px_1fr] lg:gap-6">
          <div className="lg:order-first">
            <AvatarUploader />
          </div>

          <MotionStack stagger={0.05} className="space-y-4">
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
                leftIcon={<UserIcon />}
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
                leftIcon={<MailIcon />}
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
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                leftIcon={<LockIcon />}
              />
              <PasswordStrength value={password} />
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
                errorMessage={
                  fieldError(state, "confirmPassword") ?? liveMismatch
                }
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                leftIcon={<LockIcon />}
              />
            </div>
          </MotionStack>
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
