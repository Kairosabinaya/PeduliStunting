interface AuthSeparatorProps {
  readonly label: string;
}

/** Horizontal "atau" separator shared between password and OAuth blocks. */
export function AuthSeparator({ label }: AuthSeparatorProps) {
  return (
    <div
      className="flex items-center gap-3 text-xs uppercase tracking-wide text-muted-foreground"
      aria-hidden
    >
      <span className="h-px flex-1 bg-border" />
      {label}
      <span className="h-px flex-1 bg-border" />
    </div>
  );
}
