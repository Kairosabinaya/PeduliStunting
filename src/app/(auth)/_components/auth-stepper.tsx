import { AUTH_LABELS } from "@/config/auth";

interface AuthStepperProps {
  /** 1-based current step. */
  readonly currentStep: 1 | 2;
}

const STEPS = [
  { id: 1, label: AUTH_LABELS.stepper.step1 },
  { id: 2, label: AUTH_LABELS.stepper.step2 },
] as const;

/**
 * Two-step progress indicator used on `/auth/sign-up`. Step 1 = "Isi
 * data", Step 2 = "Verifikasi email" (after the form submits and the
 * verification banner appears). Uses an ordered list so screen readers
 * announce the sequence; `aria-current="step"` flags the active node.
 *
 * Server-rendered — no client interactivity required.
 *
 * @example
 * ```tsx
 * <AuthStepper currentStep={1} />
 * ```
 */
export function AuthStepper({ currentStep }: AuthStepperProps) {
  return (
    <nav aria-label="Tahap pendaftaran" className="w-full">
      <ol className="flex items-center gap-3">
        {STEPS.map((step, index) => {
          const isActive = step.id === currentStep;
          const isComplete = step.id < currentStep;
          return (
            <li
              key={step.id}
              className="flex flex-1 items-center gap-3"
              aria-current={isActive ? "step" : undefined}
            >
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                  isComplete
                    ? "bg-success text-white"
                    : isActive
                      ? "bg-primary text-primary-foreground ring-2 ring-brand-200 ring-offset-2 ring-offset-background"
                      : "bg-muted text-muted-foreground"
                }`}
                aria-hidden
              >
                {isComplete ? <CheckIcon /> : step.id}
              </span>
              <span
                className={`text-sm ${
                  isActive
                    ? "font-semibold text-foreground"
                    : "font-medium text-muted-foreground"
                }`}
              >
                {step.label}
              </span>
              {index < STEPS.length - 1 ? (
                <span
                  aria-hidden
                  className={`h-px flex-1 ${isComplete ? "bg-success" : "bg-border"}`}
                />
              ) : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/** Inline check glyph for a completed step (SVG, not a font-dependent ✓). */
function CheckIcon() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={3}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-3.5 w-3.5"
    >
      <path d="m5 13 4 4L19 7" />
    </svg>
  );
}
