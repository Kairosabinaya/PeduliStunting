"use client";

import { useMemo } from "react";

import { AUTH_LABELS } from "@/config/auth";

interface PasswordStrengthProps {
  readonly value: string;
}

interface StrengthAssessment {
  readonly score: 0 | 1 | 2 | 3 | 4;
  readonly label: string;
}

/**
 * Cheap entropy heuristic — score the password on length and character
 * variety. We deliberately avoid `zxcvbn`-style heavy libraries here
 * because the gain vs the ~250KB they ship is not worth it for an
 * MVP. This is a UX hint, not authoritative.
 */
function assess(value: string): StrengthAssessment {
  if (value.length === 0) return { score: 0, label: "" };

  let score = 0;
  if (value.length >= 8) score += 1;
  if (value.length >= 12) score += 1;
  const hasLower = /[a-z]/u.test(value);
  const hasUpper = /[A-Z]/u.test(value);
  const hasDigit = /[0-9]/u.test(value);
  const hasSymbol = /[^A-Za-z0-9]/u.test(value);
  const classes = [hasLower, hasUpper, hasDigit, hasSymbol].filter(
    Boolean,
  ).length;
  if (classes >= 2) score += 1;
  if (classes >= 4) score += 1;
  const clamped = Math.min(4, score) as 0 | 1 | 2 | 3 | 4;

  const label =
    clamped <= 1
      ? AUTH_LABELS.passwordStrength.weak
      : clamped === 2
        ? AUTH_LABELS.passwordStrength.fair
        : clamped === 3
          ? AUTH_LABELS.passwordStrength.good
          : AUTH_LABELS.passwordStrength.strong;

  return { score: clamped, label };
}

const COLOR_BY_SCORE: Record<0 | 1 | 2 | 3 | 4, string> = {
  0: "bg-border",
  1: "bg-danger",
  2: "bg-warning",
  3: "bg-success",
  4: "bg-success",
};

/**
 * Visual indicator showing how strong the typed password is. Four bars
 * fill up as the heuristic score climbs from 0 to 4. `aria-live` keeps
 * screen reader users informed without interrupting typing.
 *
 * @example
 * ```tsx
 * const password = watch("password");
 * <PasswordStrength value={password ?? ""} />
 * ```
 */
export function PasswordStrength({ value }: PasswordStrengthProps) {
  const { score, label } = useMemo(() => assess(value), [value]);
  const tint = COLOR_BY_SCORE[score];

  return (
    <div
      className="flex items-center gap-3"
      role="group"
      aria-label={AUTH_LABELS.passwordStrength.label}
    >
      <div className="flex flex-1 gap-1">
        {[1, 2, 3, 4].map((segment) => (
          <span
            key={segment}
            aria-hidden
            className={`h-1.5 flex-1 rounded-full transition-colors ${
              score >= segment ? tint : "bg-border"
            }`}
          />
        ))}
      </div>
      <span
        className="min-w-[3.5rem] text-right text-xs font-medium text-muted-foreground"
        aria-live="polite"
      >
        {label}
      </span>
    </div>
  );
}
