/**
 * Client-safe public environment values — the browser-bundle counterpart of
 * `env.ts` (ALL `process.env` access stays inside `/src/config/env*.ts`; this
 * file is that boundary for client-reachable code).
 *
 * Why not just import `env.ts`? Its Zod schema dragged the whole Zod
 * runtime (~64 KB transferred, ~250 ms of mobile main-thread execution)
 * into EVERY route's client bundle through the
 * `config/app.ts -> config/env.ts` chain, because shared UI reads
 * `APP_NAME`/`APP_URL`. `NEXT_PUBLIC_*` values are inlined as string
 * literals at build time, so the client needs no runtime validation —
 * the authoritative Zod validation still happens server-side at boot in
 * `env.ts` (same defaults, same vars).
 */
export const PUBLIC_ENV = {
  /** Mirrors `env.NEXT_PUBLIC_APP_NAME` (default in env.ts). */
  appName:
    process.env.NEXT_PUBLIC_APP_NAME &&
    process.env.NEXT_PUBLIC_APP_NAME.length > 0
      ? process.env.NEXT_PUBLIC_APP_NAME
      : "Peduli Stunting",
  /** Mirrors `env.NEXT_PUBLIC_APP_URL` (default in env.ts). */
  appUrl:
    process.env.NEXT_PUBLIC_APP_URL &&
    process.env.NEXT_PUBLIC_APP_URL.length > 0
      ? process.env.NEXT_PUBLIC_APP_URL
      : "http://localhost:3000",
} as const;
