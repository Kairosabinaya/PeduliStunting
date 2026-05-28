import type { ReactNode } from "react";

interface AuthSectionHeaderProps {
  readonly eyebrow: string;
  readonly title: string;
  readonly description: string;
  /**
   * Optional content slot inserted between the description and the
   * surrounding form. Used on /auth/sign-up to host the AuthStepper.
   */
  readonly children?: ReactNode;
}

/**
 * Display header reused across sign-in, sign-up, reset, and update
 * password pages. Pulls the eyebrow, title, and description from the
 * page-level `AuthPageCopy` so the four pages stay visually consistent
 * without duplicating markup.
 *
 * @example
 * ```tsx
 * <AuthSectionHeader
 *   eyebrow={SIGN_IN_COPY.eyebrow}
 *   title={SIGN_IN_COPY.title}
 *   description={SIGN_IN_COPY.description}
 * />
 * ```
 */
export function AuthSectionHeader({
  eyebrow,
  title,
  description,
  children,
}: AuthSectionHeaderProps) {
  return (
    <header className="space-y-3">
      <p className="eyebrow">{eyebrow}</p>
      <div className="space-y-2">
        <h1 className="auth-headline text-foreground">{title}</h1>
        <p className="text-pretty text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      </div>
      {children}
    </header>
  );
}
