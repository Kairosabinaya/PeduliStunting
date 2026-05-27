"use client";

import { useId, useState, forwardRef } from "react";

import { AUTH_LABELS } from "@/config/auth";
import { Input, type InputProps } from "@/components/primitives/input";
import { cn } from "@/lib/cn";

interface PasswordInputProps extends Omit<InputProps, "type"> {
  /** Label for the visibility toggle when password is hidden. */
  readonly showLabel?: string;
  /** Label for the visibility toggle when password is visible. */
  readonly hideLabel?: string;
}

/**
 * Password field with an accessible show/hide toggle. The toggle is a real
 * button (keyboard reachable, announces the current visibility via the
 * `aria-label` swap) overlaid on the input.
 */
export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  function PasswordInput(
    {
      showLabel = AUTH_LABELS.showPassword,
      hideLabel = AUTH_LABELS.hidePassword,
      className,
      ...rest
    },
    ref,
  ) {
    const reactId = useId();
    const inputId = rest.id ?? `password-${reactId}`;
    const [visible, setVisible] = useState(false);

    return (
      <div className="relative">
        <Input
          ref={ref}
          {...rest}
          id={inputId}
          type={visible ? "text" : "password"}
          className={cn("pr-12", className)}
        />
        <button
          type="button"
          aria-label={visible ? hideLabel : showLabel}
          aria-controls={inputId}
          aria-pressed={visible}
          onClick={() => setVisible((current) => !current)}
          className="absolute right-1 top-1 inline-flex h-9 w-10 items-center justify-center rounded-md text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
        >
          {visible ? <EyeOffIcon /> : <EyeIcon />}
        </button>
      </div>
    );
  },
);

function EyeIcon() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
    >
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
    >
      <path d="M9.88 5.16A10.94 10.94 0 0 1 12 5c6.5 0 10 7 10 7a17.36 17.36 0 0 1-3.07 4.13" />
      <path d="M6.62 6.62A17.34 17.34 0 0 0 2 12s3.5 7 10 7a10.9 10.9 0 0 0 4.93-1.13" />
      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
      <path d="m2 2 20 20" />
    </svg>
  );
}
