/**
 * Lighthouse audit harness for the optimization loop.
 *
 * Runs `npx lighthouse` headless against a locally served production build
 * (`pnpm build && pnpm start`) for every audited route, in mobile (default
 * Lighthouse throttling) and desktop presets, then parses each JSON report
 * and emits:
 *   - per-category scores,
 *   - every FAILING weighted audit (the ones that actually move the score),
 *   - diagnostics regardless of weight: LCP element, console errors,
 *     contrast failures, bootup time, heaviest network requests.
 *
 * A human-readable digest is written to `.lighthouse/summary.md`; raw JSON
 * reports live next to it for deeper inspection.
 *
 * Usage:
 *   pnpm audit:lighthouse                       # all routes, both form factors
 *   pnpm audit:lighthouse -- --routes=/,/map    # subset
 *   pnpm audit:lighthouse -- --ff=mobile        # one form factor
 *   LH_COOKIE="sb-...=..." pnpm audit:lighthouse -- --routes=/tracker
 *
 * `/map` mobile runs `MAP_RUNS` times and reports the median performance
 * score (WebGL boot timing varies run-to-run under simulated throttling).
 */
import { spawnSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { argv, env } from "node:process";

import { z } from "zod";

import { runScript } from "./_lib/script-context.ts";

const OUTPUT_DIR = resolve(".lighthouse");
const BASE_URL = env.LH_BASE_URL ?? "http://localhost:3000";
const MAP_RUNS = 3;
const CATEGORIES = [
  "performance",
  "accessibility",
  "best-practices",
  "seo",
] as const;
const DIAGNOSTIC_AUDITS = [
  "largest-contentful-paint-element",
  "errors-in-console",
  "bootup-time",
  "mainthread-work-breakdown",
] as const;

interface AuditRoute {
  readonly slug: string;
  readonly path: string;
  readonly needsCookie: boolean;
}

const ROUTES: readonly AuditRoute[] = [
  { slug: "home", path: "/", needsCookie: false },
  { slug: "map", path: "/map", needsCookie: false },
  { slug: "data", path: "/data", needsCookie: false },
  { slug: "prediksi", path: "/prediksi", needsCookie: false },
  { slug: "tracker", path: "/tracker", needsCookie: true },
];

const AuditSchema = z.object({
  score: z.number().nullable().optional(),
  scoreDisplayMode: z.string().optional(),
  title: z.string().optional(),
  displayValue: z.string().optional(),
  details: z.unknown().optional(),
});
const LhrSchema = z.object({
  categories: z.record(
    z.string(),
    z.object({
      score: z.number().nullable(),
      auditRefs: z.array(z.object({ id: z.string(), weight: z.number() })),
    }),
  ),
  audits: z.record(z.string(), AuditSchema),
});
type Lhr = z.infer<typeof LhrSchema>;

/** Walk an unknown details tree and collect axe/LCP node descriptions. */
function collectNodeSnippets(value: unknown, out: string[]): void {
  if (Array.isArray(value)) {
    for (const item of value) collectNodeSnippets(item, out);
    return;
  }
  if (value === null || typeof value !== "object") return;
  const record = value as Record<string, unknown>;
  const node = record["node"];
  if (node !== null && typeof node === "object") {
    const n = node as Record<string, unknown>;
    const parts = [n["selector"], n["snippet"], n["explanation"]]
      .filter((p): p is string => typeof p === "string" && p.length > 0)
      .join(" | ");
    if (parts.length > 0) out.push(parts);
  }
  for (const child of Object.values(record)) collectNodeSnippets(child, out);
}

/** Pull `description`/`url` strings from a details table (console errors). */
function collectItemMessages(details: unknown): readonly string[] {
  if (details === null || typeof details !== "object") return [];
  const items = (details as Record<string, unknown>)["items"];
  if (!Array.isArray(items)) return [];
  const MessageSchema = z.object({
    description: z.string().optional(),
    url: z.string().optional(),
    sourceLocation: z.object({ url: z.string() }).optional(),
  });
  return items
    .map((item) => MessageSchema.safeParse(item))
    .filter((parsed) => parsed.success)
    .map((parsed) => parsed.data)
    .filter((item) => item.description !== undefined)
    .map(
      (item) =>
        `${item.description ?? ""} [${item.sourceLocation?.url ?? item.url ?? ""}]`,
    );
}

/** Top network requests by transferSize from the `network-requests` audit. */
function topRequests(lhr: Lhr, limit: number): readonly string[] {
  const details = lhr.audits["network-requests"]?.details;
  if (details === null || typeof details !== "object") return [];
  const items = (details as Record<string, unknown>)["items"];
  if (!Array.isArray(items)) return [];
  const RequestSchema = z.object({
    url: z.string(),
    transferSize: z.number().optional(),
    resourceType: z.string().optional(),
  });
  return items
    .map((item) => RequestSchema.safeParse(item))
    .filter((parsed) => parsed.success)
    .map((parsed) => parsed.data)
    .sort((a, b) => (b.transferSize ?? 0) - (a.transferSize ?? 0))
    .slice(0, limit)
    .map(
      (request) =>
        `${Math.round((request.transferSize ?? 0) / 1024)} KB  ${request.resourceType ?? "?"}  ${request.url}`,
    );
}

function summarizeReport(lhr: Lhr): string {
  const lines: string[] = [];
  for (const category of CATEGORIES) {
    const cat = lhr.categories[category];
    if (!cat) continue;
    const score = cat.score === null ? "n/a" : Math.round(cat.score * 100);
    lines.push(`### ${category}: ${score}`);
    for (const ref of cat.auditRefs) {
      const audit = lhr.audits[ref.id];
      if (!audit || ref.weight === 0) continue;
      const mode = audit.scoreDisplayMode ?? "";
      if (["notApplicable", "informative", "manual"].includes(mode)) continue;
      if (audit.score === null || audit.score === undefined) continue;
      if (audit.score >= 1) continue;
      lines.push(
        `- FAIL [w${ref.weight}] ${ref.id}: ${audit.title ?? ""} (${audit.displayValue ?? `score ${audit.score}`})`,
      );
      const nodes: string[] = [];
      collectNodeSnippets(audit.details, nodes);
      for (const node of nodes.slice(0, 8)) lines.push(`    - ${node}`);
    }
  }
  lines.push("### diagnostics");
  for (const id of DIAGNOSTIC_AUDITS) {
    const audit = lhr.audits[id];
    if (!audit) continue;
    lines.push(`- ${id}: ${audit.displayValue ?? `score ${audit.score}`}`);
    const nodes: string[] = [];
    collectNodeSnippets(audit.details, nodes);
    for (const node of nodes.slice(0, 4)) lines.push(`    - ${node}`);
    for (const message of collectItemMessages(audit.details).slice(0, 6)) {
      lines.push(`    - ${message}`);
    }
  }
  lines.push("### heaviest requests");
  for (const line of topRequests(lhr, 10)) lines.push(`- ${line}`);
  return lines.join("\n");
}

function runLighthouse(
  route: AuditRoute,
  formFactor: "mobile" | "desktop",
  attempt: number,
): Lhr | null {
  const suffix = attempt > 0 ? `-${attempt + 1}` : "";
  const outputPath = resolve(
    OUTPUT_DIR,
    `${route.slug}-${formFactor}${suffix}.json`,
  );
  const parts = [
    "npx lighthouse",
    `"${BASE_URL}${route.path}"`,
    "--output=json",
    `--output-path="${outputPath}"`,
    '--chrome-flags="--headless=new"',
    `--only-categories=${CATEGORIES.join(",")}`,
    "--quiet",
  ];
  if (formFactor === "desktop") parts.push("--preset=desktop");
  if (route.needsCookie) {
    const headersPath = resolve(OUTPUT_DIR, "headers.json");
    writeFileSync(headersPath, JSON.stringify({ Cookie: env.LH_COOKIE ?? "" }));
    parts.push(`--extra-headers="${headersPath}"`);
  }
  // Warm the route before measuring: routes are force-dynamic and their
  // research data sits behind long-lived `unstable_cache` entries, so the
  // first hit after a build pays cold Supabase roundtrips no real visitor
  // sees in steady state. Two hits make the second fully warm.
  for (let warm = 0; warm < 2; warm += 1) {
    spawnSync(`curl -s -o NUL "${BASE_URL}${route.path}"`, {
      shell: true,
      timeout: 60_000,
    });
  }
  const result = spawnSync(parts.join(" "), {
    shell: true,
    stdio: ["ignore", "inherit", "inherit"],
    timeout: 300_000,
  });
  if (result.status !== 0) return null;
  const raw: unknown = JSON.parse(readFileSync(outputPath, "utf8"));
  const parsed = LhrSchema.safeParse(raw);
  return parsed.success ? parsed.data : null;
}

function parseArgs(): {
  routes: readonly AuditRoute[];
  ffs: readonly ("mobile" | "desktop")[];
} {
  const routesArg = argv.find((a) => a.startsWith("--routes="));
  const ffArg = argv.find((a) => a.startsWith("--ff="));
  const wantedPaths = routesArg
    ? routesArg.replace("--routes=", "").split(",")
    : null;
  const routes = ROUTES.filter((route) => {
    if (route.needsCookie && (env.LH_COOKIE ?? "").length === 0) return false;
    return wantedPaths === null || wantedPaths.includes(route.path);
  });
  const ff = ffArg ? ffArg.replace("--ff=", "") : "both";
  const ffs: readonly ("mobile" | "desktop")[] =
    ff === "mobile"
      ? ["mobile"]
      : ff === "desktop"
        ? ["desktop"]
        : ["mobile", "desktop"];
  return { routes, ffs };
}

await runScript("audit-lighthouse", async ({ logger }) => {
  mkdirSync(OUTPUT_DIR, { recursive: true });
  const { routes, ffs } = parseArgs();
  const summary: string[] = [`# Lighthouse audit — ${BASE_URL}`];

  for (const route of routes) {
    for (const formFactor of ffs) {
      const runs =
        route.slug === "map" && formFactor === "mobile" ? MAP_RUNS : 1;
      const reports: Lhr[] = [];
      for (let attempt = 0; attempt < runs; attempt += 1) {
        const lhr = runLighthouse(route, formFactor, attempt);
        if (lhr) reports.push(lhr);
        else
          logger.warn("lighthouse.run.failed", {
            route: route.path,
            formFactor,
            attempt,
          });
      }
      if (reports.length === 0) continue;
      const byPerf = [...reports].sort(
        (a, b) =>
          (a.categories["performance"]?.score ?? 0) -
          (b.categories["performance"]?.score ?? 0),
      );
      const median = byPerf[Math.floor(byPerf.length / 2)];
      if (!median) continue;
      const scores = Object.fromEntries(
        CATEGORIES.map((category) => [
          category,
          median.categories[category]?.score === null ||
          median.categories[category] === undefined
            ? null
            : Math.round((median.categories[category]?.score ?? 0) * 100),
        ]),
      );
      logger.info("route.scores", {
        route: route.path,
        formFactor,
        runs: reports.length,
        ...scores,
      });
      summary.push(
        `\n## ${route.path} (${formFactor}${runs > 1 ? `, median of ${reports.length}` : ""})\n`,
      );
      summary.push(summarizeReport(median));
    }
  }

  const summaryPath = resolve(OUTPUT_DIR, "summary.md");
  writeFileSync(summaryPath, `${summary.join("\n")}\n`);
  logger.info("summary.written", { path: summaryPath });
});
