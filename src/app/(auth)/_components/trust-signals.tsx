import { AUTH_LABELS } from "@/config/auth";

const SIGNALS = [
  {
    key: "encrypted",
    label: AUTH_LABELS.trustSignals.encrypted,
    icon: (
      <svg
        aria-hidden
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-4 w-4"
      >
        <rect x="4" y="11" width="16" height="9" rx="2" />
        <path d="M8 11V8a4 4 0 0 1 8 0v3" />
      </svg>
    ),
  },
  {
    key: "free",
    label: AUTH_LABELS.trustSignals.free,
    icon: (
      <svg
        aria-hidden
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-4 w-4"
      >
        <circle cx="12" cy="12" r="9" />
        <path d="m9 12 2 2 4-4" />
      </svg>
    ),
  },
  {
    key: "official",
    label: AUTH_LABELS.trustSignals.official,
    icon: (
      <svg
        aria-hidden
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-4 w-4"
      >
        <path d="M12 3 4 6v6c0 4.5 3.5 8.5 8 9 4.5-.5 8-4.5 8-9V6z" />
      </svg>
    ),
  },
] as const;

/**
 * Three short value props rendered as horizontal pills in the auth brand
 * panel. Kept dependency-free (icons are inline SVG) so the panel stays
 * within the Lighthouse / bundle budget. Purely presentational.
 *
 * @example
 * ```tsx
 * <TrustSignals />
 * ```
 */
export function TrustSignals() {
  return (
    <ul className="flex flex-wrap gap-2" aria-label="Manfaat akun">
      {SIGNALS.map((signal) => (
        <li
          key={signal.key}
          className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm"
        >
          {signal.icon}
          <span>{signal.label}</span>
        </li>
      ))}
    </ul>
  );
}
