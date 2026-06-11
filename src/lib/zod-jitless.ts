import { z } from "zod";

/**
 * Force Zod's jitless mode globally (side-effect module).
 *
 * Zod 4's default fast path probes `new Function("")` once to decide whether
 * it may JIT-compile validators. Under the app's nonce-based CSP (no
 * `unsafe-eval`) that probe logs a violation to the DevTools Issues panel on
 * every page — even when the policy is enforced and the probe fails
 * gracefully — which fails Lighthouse's `inspector-issues` audit. Jitless
 * skips the probe entirely; validation behaviour is identical, only the
 * eval-based speedup is disabled.
 *
 * Imported for side effect at the top of the server graph
 * (`src/app/layout.tsx`) and at the top of every `src/schemas/*` module, so
 * any bundle that contains Zod also contains the jitless switch. It must
 * NOT be imported by always-mounted client chrome (e.g. ThemeProvider) —
 * that would drag Zod into every route's bundle and undo the
 * `config/env.client.ts` weight savings.
 */
z.config({ jitless: true });
