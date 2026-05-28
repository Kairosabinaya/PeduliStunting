"use client";

import {
  useActionState,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import type { UserProfileDto } from "@/application/account/dtos";
import { updateAvatar } from "@/app/(app)/account/actions";
import {
  INITIAL_UPDATE_AVATAR_STATE,
  type UpdateAvatarFormState,
} from "@/app/(app)/account/_lib/update-avatar-state";
import { Avatar } from "@/components/primitives/avatar";
import { Button } from "@/components/primitives/button";
import { FeedbackBanner } from "@/components/primitives/feedback-banner";
import { AUTH_LABELS } from "@/config/auth";
import {
  AVATAR_ALLOWED_MIME,
  AVATAR_MAX_BYTES,
  type AvatarMimeType,
} from "@/schemas/avatar";

interface AvatarEditorProps {
  readonly profile: UserProfileDto;
  readonly email: string | null;
}

function isAllowedMime(value: string): value is AvatarMimeType {
  return (AVATAR_ALLOWED_MIME as readonly string[]).includes(value);
}

/**
 * Avatar editor on the `/account` page. Two affordances: "Ganti foto" opens
 * the file picker and submits via the `updateAvatar` Server Action; "Hapus
 * foto" submits with `action=clear` to remove the avatar entirely.
 *
 * Sits next to the {@link ProfileForm} so the user can update preferences
 * and the avatar without leaving the page. The Server Action is the only
 * boundary that talks to Storage — there is no admin client involved here
 * because the user has a valid session.
 */
export function AvatarEditor({ profile, email }: AvatarEditorProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const replaceFormRef = useRef<HTMLFormElement | null>(null);
  const clearFormRef = useRef<HTMLFormElement | null>(null);
  const [clientError, setClientError] = useState<string | null>(null);
  const [state, action, isPending] = useActionState<
    UpdateAvatarFormState | null,
    FormData
  >(updateAvatar, INITIAL_UPDATE_AVATAR_STATE);

  // Clear the file input + transient error once a save lands successfully.
  useEffect(() => {
    if (state?.ok && inputRef.current) {
      inputRef.current.value = "";
      setClientError(null);
    }
  }, [state]);

  const currentAvatar = state?.profile?.avatarUrl ?? profile.avatarUrl;
  const succeeded = state?.ok === true;
  const error =
    clientError ?? (state && !state.ok ? (state.message ?? null) : null);

  const onFileSelected = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setClientError(null);
      const file = event.target.files?.[0];
      if (!file) return;
      if (!isAllowedMime(file.type)) {
        setClientError("Format foto harus JPG, PNG, atau WebP.");
        return;
      }
      if (file.size > AVATAR_MAX_BYTES) {
        setClientError("Ukuran foto maksimal 2 MB.");
        return;
      }
      if (file.size < 1024) {
        setClientError("File foto terlalu kecil atau rusak.");
        return;
      }
      replaceFormRef.current?.requestSubmit();
    },
    [],
  );

  return (
    <section
      aria-labelledby="account-avatar-heading"
      className="rounded-2xl border border-border bg-surface p-5 shadow-xs"
    >
      <h2
        id="account-avatar-heading"
        className="text-sm font-semibold text-foreground"
      >
        {AUTH_LABELS.avatar.label}
      </h2>

      <div className="mt-4 flex flex-col items-center gap-4 sm:flex-row sm:items-start sm:gap-6">
        <Avatar
          src={currentAvatar}
          displayName={profile.displayName}
          email={email}
          size="2xl"
          ring="default"
        />

        <div className="flex flex-1 flex-col gap-3">
          <p className="text-xs text-muted-foreground">
            {AUTH_LABELS.avatar.hint}
          </p>

          <div className="flex flex-wrap gap-2">
            <form
              ref={replaceFormRef}
              action={action}
              encType="multipart/form-data"
            >
              <input
                ref={inputRef}
                type="file"
                name="file"
                accept={AVATAR_ALLOWED_MIME.join(",")}
                className="sr-only"
                onChange={onFileSelected}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                loading={isPending}
                onClick={() => inputRef.current?.click()}
              >
                {currentAvatar
                  ? AUTH_LABELS.avatar.change
                  : AUTH_LABELS.avatar.upload}
              </Button>
            </form>
            {currentAvatar ? (
              <form ref={clearFormRef} action={action}>
                <input type="hidden" name="action" value="clear" />
                <Button
                  type="submit"
                  variant="ghost"
                  size="sm"
                  disabled={isPending}
                >
                  {AUTH_LABELS.avatar.remove}
                </Button>
              </form>
            ) : null}
          </div>

          {error ? <FeedbackBanner tone="error">{error}</FeedbackBanner> : null}
          {succeeded ? (
            <FeedbackBanner tone="success">
              Foto profil tersimpan.
            </FeedbackBanner>
          ) : null}
        </div>
      </div>
    </section>
  );
}
