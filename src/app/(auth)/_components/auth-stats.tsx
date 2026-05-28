import { AUTH_STATS } from "@/config/auth";

/**
 * Three-value social-proof row anchored in the auth brand panel. Values
 * are static from `AUTH_STATS` so the public auth route never touches
 * the database. The list semantic + `aria-label` keeps assistive tech
 * happy without inflating the DOM.
 */
export function AuthStats() {
  return (
    <ul
      aria-label="Statistik Peduli Stunting"
      className="grid grid-cols-3 gap-4 sm:gap-6"
    >
      {AUTH_STATS.map((stat) => (
        <li key={stat.label} className="space-y-1">
          <p className="text-2xl font-extrabold tabular-nums leading-none text-white sm:text-3xl">
            {stat.value}
          </p>
          <p className="text-xs font-medium leading-snug text-white/90 sm:text-sm">
            {stat.label}
          </p>
        </li>
      ))}
    </ul>
  );
}
