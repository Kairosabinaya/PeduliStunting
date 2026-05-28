import type { PosyanduServiceIcon } from "@/data/edukasi/posyandu";

interface ServiceIconProps {
  readonly icon: PosyanduServiceIcon;
  readonly className?: string;
}

/**
 * Hand-rolled SVG icons for the four posyandu services. Kept inline so we
 * do not load lucide-react bundle merely for four glyphs that are easy to
 * draw. `currentColor` propagation lets the parent control the tint.
 */
export function ServiceIcon({ icon, className }: ServiceIconProps) {
  switch (icon) {
    case "measure":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
          aria-hidden="true"
        >
          <rect x="3" y="9" width="18" height="6" rx="1.5" />
          <path d="M7 9v3M11 9v4M15 9v3M19 9v4" />
        </svg>
      );
    case "syringe":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
          aria-hidden="true"
        >
          <path d="M16 4l4 4" />
          <path d="M14 6l4 4" />
          <path d="M18 8l-9.5 9.5" />
          <path d="M8.5 17.5L3 23" />
          <path d="M11 14l3 3" />
        </svg>
      );
    case "spoon":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
          aria-hidden="true"
        >
          <path d="M12 3a4 4 0 0 1 4 4c0 2.5-2 4-4 4s-4-1.5-4-4a4 4 0 0 1 4-4z" />
          <path d="M12 11v10" />
        </svg>
      );
    case "pill":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
          aria-hidden="true"
        >
          <rect x="3" y="9" width="18" height="6" rx="3" />
          <path d="M12 9v6" />
        </svg>
      );
    case "stethoscope":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
          aria-hidden="true"
        >
          <path d="M6 3v6a4 4 0 0 0 8 0V3" />
          <path d="M10 13v3a5 5 0 0 0 10 0v-3" />
          <circle cx="20" cy="9" r="2" />
        </svg>
      );
    default:
      return null;
  }
}
