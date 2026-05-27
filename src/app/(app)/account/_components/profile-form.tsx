"use client";

import { useActionState, useEffect, useId, useState } from "react";
import { useFormStatus } from "react-dom";

import type { UserProfileDto } from "@/application/account/dtos";
import {
  ACCOUNT_FORM_COPY,
  ACCOUNT_GENERIC_ERROR,
  LOCALE_OPTIONS,
  THEME_OPTIONS,
} from "@/config/account";
import { DEFAULT_LOCALE, type SupportedLocale } from "@/config/locales";
import { Button } from "@/components/primitives/button";
import { FeedbackBanner } from "@/components/primitives/feedback-banner";
import { Input } from "@/components/primitives/input";
import { Label } from "@/components/primitives/label";
import { Select } from "@/components/primitives/select";
import { useTheme } from "@/components/theme/theme-provider";
import type { ThemePreference } from "@/domain/account/entities/user-profile";

import { updateProfile } from "../actions";
import {
  INITIAL_UPDATE_PROFILE_STATE,
  type UpdateProfileFormState,
} from "../_lib/update-profile-state";

interface ProfileFormProps {
  readonly profile: UserProfileDto;
}

function SubmitButton({ disabled }: { readonly disabled: boolean }) {
  const status = useFormStatus();
  return (
    <Button
      type="submit"
      loading={status.pending}
      disabled={disabled || status.pending}
    >
      {ACCOUNT_FORM_COPY.submit}
    </Button>
  );
}

function ResetButton({
  onReset,
  disabled,
}: {
  readonly onReset: () => void;
  readonly disabled: boolean;
}) {
  const status = useFormStatus();
  return (
    <Button
      type="button"
      variant="ghost"
      onClick={onReset}
      disabled={disabled || status.pending}
    >
      {ACCOUNT_FORM_COPY.resetDirty}
    </Button>
  );
}

function fieldError(
  state: UpdateProfileFormState | null,
  field: string,
): string | undefined {
  return state?.fieldErrors?.[field]?.[0];
}

interface FormValues {
  readonly displayName: string;
  readonly themePreference: ThemePreference;
  readonly locale: SupportedLocale;
}

function toFormValues(profile: UserProfileDto): FormValues {
  return {
    displayName: profile.displayName ?? "",
    themePreference: profile.themePreference,
    locale:
      LOCALE_OPTIONS.find((o) => o.value === profile.locale)?.value ??
      DEFAULT_LOCALE,
  };
}

function isDirty(initial: FormValues, current: FormValues): boolean {
  return (
    initial.displayName.trim() !== current.displayName.trim() ||
    initial.themePreference !== current.themePreference ||
    initial.locale !== current.locale
  );
}

/**
 * Editable preferences form for {@link UserProfileDto}. Submits to the
 * `updateProfile` Server Action via `useActionState` so React owns the
 * pending state, then synchronises the local theme store on success so the
 * UI reflects the saved value without waiting for the next round trip.
 */
export function ProfileForm({ profile }: ProfileFormProps) {
  const initial = toFormValues(profile);
  const [state, action] = useActionState<
    UpdateProfileFormState | null,
    FormData
  >(updateProfile, INITIAL_UPDATE_PROFILE_STATE);

  const [values, setValues] = useState<FormValues>(initial);
  const [seenState, setSeenState] =
    useState<UpdateProfileFormState | null>(state);
  const { setTheme } = useTheme();

  const displayNameId = useId();
  const themeId = useId();
  const localeId = useId();

  // Storing-information-from-previous-renders pattern: when a new action
  // result arrives, snap local values to the persisted profile so the form
  // reflects the freshly saved state without an Effect-triggered re-render.
  // See: https://react.dev/reference/react/useState#storing-information-from-previous-renders
  if (state !== seenState) {
    setSeenState(state);
    if (state?.ok && state.profile) {
      setValues(toFormValues(state.profile));
    }
  }

  const succeeded = state?.ok === true;
  const generalError =
    state && !state.ok && !state.fieldErrors
      ? (state.message ?? ACCOUNT_GENERIC_ERROR)
      : null;

  // Sync the external theme store on every successful save. The theme provider
  // is an external system (subscribes via useSyncExternalStore), so Effect is
  // the right home for the call.
  useEffect(() => {
    if (state?.ok && state.profile) {
      setTheme(state.profile.themePreference);
    }
  }, [state, setTheme]);

  const dirty = isDirty(initial, values);

  function handleReset() {
    setValues(initial);
  }

  return (
    <form action={action} className="space-y-5" noValidate>
      <div className="space-y-2">
        <Label htmlFor={displayNameId}>{ACCOUNT_FORM_COPY.displayNameLabel}</Label>
        <Input
          id={displayNameId}
          name="displayName"
          type="text"
          inputMode="text"
          autoComplete="nickname"
          maxLength={80}
          placeholder={ACCOUNT_FORM_COPY.displayNamePlaceholder}
          hint={ACCOUNT_FORM_COPY.displayNameHint}
          errorMessage={fieldError(state, "displayName")}
          value={values.displayName}
          onChange={(e) =>
            setValues((v) => ({ ...v, displayName: e.target.value }))
          }
        />
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor={themeId}>{ACCOUNT_FORM_COPY.themeLabel}</Label>
          <Select
            id={themeId}
            name="themePreference"
            hint={ACCOUNT_FORM_COPY.themeHint}
            errorMessage={fieldError(state, "themePreference")}
            value={values.themePreference}
            onChange={(e) =>
              setValues((v) => ({
                ...v,
                themePreference: e.target.value as ThemePreference,
              }))
            }
          >
            {THEME_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor={localeId}>{ACCOUNT_FORM_COPY.localeLabel}</Label>
          <Select
            id={localeId}
            name="locale"
            hint={ACCOUNT_FORM_COPY.localeHint}
            errorMessage={fieldError(state, "locale")}
            value={values.locale}
            disabled={LOCALE_OPTIONS.length <= 1}
            onChange={(e) =>
              setValues((v) => ({
                ...v,
                locale: e.target.value as SupportedLocale,
              }))
            }
          >
            {LOCALE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {generalError ? (
        <FeedbackBanner tone="error">{generalError}</FeedbackBanner>
      ) : null}
      {succeeded ? (
        <FeedbackBanner tone="success">
          {ACCOUNT_FORM_COPY.successMessage}
        </FeedbackBanner>
      ) : null}

      <div className="flex flex-wrap items-center justify-end gap-2">
        {dirty ? <ResetButton onReset={handleReset} disabled={!dirty} /> : null}
        <SubmitButton disabled={!dirty} />
      </div>
    </form>
  );
}
