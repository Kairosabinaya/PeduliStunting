"use client";

import {
  useActionState,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";

import { uploadPendingAvatar } from "@/app/(auth)/auth/sign-up/actions";
import type { UploadPendingAvatarResult } from "@/app/(auth)/auth/sign-up/actions";
import { Avatar } from "@/components/primitives/avatar";
import { Button } from "@/components/primitives/button";
import { AUTH_LABELS } from "@/config/auth";
import {
  AVATAR_ALLOWED_MIME,
  AVATAR_MAX_BYTES,
  type AvatarMimeType,
} from "@/schemas/avatar";

interface AvatarUploaderProps {
  readonly displayName?: string | null;
  readonly email?: string | null;
}

interface PendingFile {
  readonly previewUrl: string;
  readonly name: string;
  readonly sizeBytes: number;
}

function isAllowedMime(value: string): value is AvatarMimeType {
  return (AVATAR_ALLOWED_MIME as readonly string[]).includes(value);
}

function formatSize(bytes: number): string {
  if (bytes >= 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

/**
 * Avatar uploader used in the sign-up form. Lets the visitor choose a
 * file (click or drag-and-drop), validates it client-side, and posts to
 * the `uploadPendingAvatar` Server Action which handles authoritative
 * Zod + magic-byte validation and writes to the `_signup/` Storage
 * folder. The returned `pendingPath` is mirrored into a hidden field so
 * `signUpWithPassword` can promote it into `auth.users.user_metadata`.
 *
 * The component is intentionally a leaf — it doesn't know the rest of
 * the sign-up form exists. The parent owns layout & spacing.
 */
export function AvatarUploader({ displayName, email }: AvatarUploaderProps) {
  const inputId = useId();
  const hintId = useId();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [pending, setPending] = useState<PendingFile | null>(null);
  const [clientError, setClientError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [state, formAction, isPending] = useActionState<
    UploadPendingAvatarResult | null,
    FormData
  >(uploadPendingAvatar, null);

  // Revoke object URL when the preview changes or unmounts.
  useEffect(() => {
    if (!pending) return;
    return () => URL.revokeObjectURL(pending.previewUrl);
  }, [pending]);

  const onFiles = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) return;
      const file = files[0];
      if (!file) return;

      setClientError(null);

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

      setPending({
        previewUrl: URL.createObjectURL(file),
        name: file.name,
        sizeBytes: file.size,
      });

      const formData = new FormData();
      formData.set("file", file);
      formAction(formData);
    },
    [formAction],
  );

  const onClear = useCallback(() => {
    setPending(null);
    setClientError(null);
    if (inputRef.current) inputRef.current.value = "";
  }, []);

  const onDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(true);
  }, []);
  const onDragLeave = useCallback(() => setIsDragOver(false), []);
  const onDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      setIsDragOver(false);
      onFiles(event.dataTransfer.files);
    },
    [onFiles],
  );

  const serverError =
    state && !state.ok ? (state.message ?? AUTH_LABELS.avatar.upload) : null;
  const errorMessage = clientError ?? serverError;
  const uploadSucceeded = Boolean(state?.ok && state?.pendingPath);

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <label
          htmlFor={inputId}
          className="text-sm font-medium text-foreground"
        >
          {AUTH_LABELS.avatar.label}
        </label>
        <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
          {AUTH_LABELS.avatar.optional}
        </span>
      </div>

      <div
        className={`relative flex items-center gap-3 rounded-xl border-2 border-dashed p-3 transition-colors ${
          isDragOver
            ? "border-brand-400 bg-brand-50/60 dark:bg-brand-900/30"
            : "border-border bg-muted/40"
        }`}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
      >
        <Avatar
          src={pending?.previewUrl}
          displayName={displayName ?? null}
          email={email ?? null}
          size="xl"
          ring="default"
          alt={AUTH_LABELS.avatar.previewAlt}
        />

        <input
          ref={inputRef}
          id={inputId}
          type="file"
          accept={AVATAR_ALLOWED_MIME.join(",")}
          className="sr-only"
          aria-describedby={hintId}
          onChange={(event) => onFiles(event.target.files)}
        />

        <div className="min-w-0 flex-1 space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              loading={isPending}
              onClick={() => inputRef.current?.click()}
            >
              {pending ? AUTH_LABELS.avatar.change : AUTH_LABELS.avatar.upload}
            </Button>
            {pending ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onClear}
                disabled={isPending}
              >
                {AUTH_LABELS.avatar.remove}
              </Button>
            ) : null}
          </div>
          <p
            id={hintId}
            className="truncate text-xs text-muted-foreground"
            aria-live="polite"
          >
            {isPending
              ? AUTH_LABELS.avatar.uploading
              : isDragOver
                ? AUTH_LABELS.avatar.dropHere
                : pending
                  ? `${pending.name} · ${formatSize(pending.sizeBytes)}`
                  : AUTH_LABELS.avatar.hint}
          </p>
        </div>
      </div>

      {errorMessage ? (
        <p role="alert" className="text-xs font-medium text-danger">
          {errorMessage}
        </p>
      ) : null}

      <input
        type="hidden"
        name="avatarPendingPath"
        value={uploadSucceeded && state?.pendingPath ? state.pendingPath : ""}
      />
    </div>
  );
}
