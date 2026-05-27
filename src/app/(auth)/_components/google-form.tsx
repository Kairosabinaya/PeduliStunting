"use client";

import { useFormStatus } from "react-dom";

import { signInWithGoogle } from "@/app/(auth)/actions";
import { Button } from "@/components/primitives/button";

interface GoogleFormProps {
  readonly label: string;
}

function GoogleSubmit({ label }: GoogleFormProps) {
  const status = useFormStatus();
  return (
    <Button
      type="submit"
      variant="outline"
      loading={status.pending}
      fullWidth
    >
      <GoogleMark />
      <span>{label}</span>
    </Button>
  );
}

/**
 * Standalone form wrapping the Google OAuth Server Action so its pending
 * state stays isolated from the email/password form on the same page.
 */
export function GoogleForm({ label }: GoogleFormProps) {
  return (
    <form action={signInWithGoogle}>
      <GoogleSubmit label={label} />
    </form>
  );
}

function GoogleMark() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      className="h-4 w-4"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fill="#EA4335"
        d="M12 10.2v3.9h5.5c-.24 1.4-1.7 4.1-5.5 4.1-3.31 0-6-2.74-6-6.1 0-3.37 2.69-6.1 6-6.1 1.88 0 3.14.79 3.86 1.47l2.63-2.55C16.9 3.34 14.69 2.4 12 2.4 6.86 2.4 2.7 6.56 2.7 11.7c0 5.13 4.16 9.3 9.3 9.3 5.36 0 8.92-3.77 8.92-9.07 0-.61-.06-1.07-.15-1.53Z"
      />
      <path
        fill="#34A853"
        d="M3.96 7.36 6.94 9.5C7.75 7.66 9.74 6.4 12 6.4c1.88 0 3.14.79 3.86 1.47l2.63-2.55C16.9 3.34 14.69 2.4 12 2.4 8.13 2.4 4.86 4.62 3.96 7.36Z"
        opacity="0"
      />
      <path
        fill="#4285F4"
        d="M21.7 11.93c0-.61-.06-1.07-.15-1.53H12v3.9h5.5c-.22 1.27-1.5 3.7-5.5 3.7-3.31 0-6-2.74-6-6.1H2.7c0 5.13 4.16 9.3 9.3 9.3 5.36 0 9.7-3.77 9.7-9.27Z"
      />
      <path
        fill="#FBBC05"
        d="M2.7 11.9c0-.97.17-1.9.46-2.77L.18 6.78A9.95 9.95 0 0 0 0 11.9c0 1.61.39 3.13 1.08 4.47l2.95-2.29c-.2-.66-.33-1.36-.33-2.18Z"
      />
    </svg>
  );
}
