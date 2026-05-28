/**
 * Inline SVG icons used as `leftIcon` slot in the auth form inputs.
 * Sized 18×18, stroke-based so they inherit `text-muted-foreground`
 * from the Input wrapper. Marked `aria-hidden` because the surrounding
 * `<Label>` is already the field's accessible name.
 *
 * Keeping the icons inline (instead of an icon library) keeps the auth
 * route bundle lean — no new dependency, no extra HTTP request.
 */

const COMMON_PROPS = {
  "aria-hidden": true,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  className: "h-[18px] w-[18px]",
};

export function MailIcon() {
  return (
    <svg {...COMMON_PROPS}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m4 7 8 6 8-6" />
    </svg>
  );
}

export function LockIcon() {
  return (
    <svg {...COMMON_PROPS}>
      <rect x="4" y="11" width="16" height="9" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

export function UserIcon() {
  return (
    <svg {...COMMON_PROPS}>
      <circle cx="12" cy="8" r="3.6" />
      <path d="M5 20a7 7 0 0 1 14 0" />
    </svg>
  );
}
