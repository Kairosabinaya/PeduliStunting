/**
 * Shared bootstrap for `scripts/import-*.ts`.
 *
 * Scripts run with `tsx --env-file=.env.local` so `process.env` already holds
 * the developer's Supabase service-role credentials. This module exposes:
 *
 *   - {@link createScriptAdminClient}: a typed Supabase client bound to the
 *     service-role key. Used for bulk upserts that bypass RLS during local
 *     ingestion. NEVER import from app code.
 *   - {@link createScriptLogger}: a minimal structured logger writing JSON
 *     lines to stdout/stderr so script output is machine-parseable in CI.
 *   - {@link resolveSourcePath}: canonical resolver for `docs/source/*`.
 */

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import type { Database } from "../../src/types/supabase.ts";

const SUPABASE_URL_VAR = "NEXT_PUBLIC_SUPABASE_URL";
const SERVICE_ROLE_VAR = "SUPABASE_SERVICE_ROLE_KEY";

/** Resolve the project root directory (one level above `scripts/`). */
export function projectRoot(): string {
  const here = dirname(fileURLToPath(import.meta.url));
  return resolve(here, "..", "..");
}

/**
 * Resolves a path under `docs/source/`. Throws when the file is missing so
 * scripts fail fast with a clear message rather than hitting opaque parse
 * errors deep inside a library.
 */
export function resolveSourcePath(relativePath: string): string {
  const absolute = resolve(projectRoot(), "docs", "source", relativePath);
  if (!existsSync(absolute)) {
    throw new Error(
      `Source file missing: ${relativePath} (resolved to ${absolute}). ` +
        `Check that docs/source/ has the expected research artefact.`,
    );
  }
  return absolute;
}

/**
 * Returns the absolute path for a generated artefact under
 * `docs/source/_generated/`. Does NOT verify existence — callers create the
 * file as part of their script.
 */
export function resolveGeneratedPath(relativePath: string): string {
  return resolve(projectRoot(), "docs", "source", "_generated", relativePath);
}

/**
 * Build a Supabase client backed by the service-role key. This bypasses RLS
 * — only call from `scripts/` (ESLint config carves out an exemption).
 *
 * @throws when `NEXT_PUBLIC_SUPABASE_URL` or `SUPABASE_SERVICE_ROLE_KEY` are
 * missing. The error references the exact env var names so the developer
 * knows what to add to `.env.local`.
 */
export function createScriptAdminClient(): SupabaseClient<Database> {
  const url = process.env[SUPABASE_URL_VAR];
  const serviceKey = process.env[SERVICE_ROLE_VAR];
  if (!url || url.trim().length === 0) {
    throw new Error(
      `${SUPABASE_URL_VAR} is empty. Add it to .env.local before running an import script.`,
    );
  }
  if (!serviceKey || serviceKey.trim().length === 0) {
    throw new Error(
      `${SERVICE_ROLE_VAR} is empty. Copy the service-role key from Supabase Studio > Project Settings > API.`,
    );
  }
  return createClient<Database>(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export interface ScriptLogger {
  info(message: string, fields?: Record<string, unknown>): void;
  warn(message: string, fields?: Record<string, unknown>): void;
  error(message: string, fields?: Record<string, unknown>): void;
}

/**
 * Minimal structured logger that emits one JSON line per call. Avoids pulling
 * Pino into scripts because (a) ESM/CJS interop is finicky under tsx, and
 * (b) scripts only need fire-and-forget output, not transports/serializers.
 */
export function createScriptLogger(scriptName: string): ScriptLogger {
  function emit(
    stream: "stdout" | "stderr",
    level: "info" | "warn" | "error",
    message: string,
    fields?: Record<string, unknown>,
  ): void {
    const record = {
      time: new Date().toISOString(),
      level,
      script: scriptName,
      message,
      ...(fields ?? {}),
    };
    const line = `${JSON.stringify(record)}\n`;
    if (stream === "stdout") {
      process.stdout.write(line);
    } else {
      process.stderr.write(line);
    }
  }
  return {
    info(message, fields) {
      emit("stdout", "info", message, fields);
    },
    warn(message, fields) {
      emit("stderr", "warn", message, fields);
    },
    error(message, fields) {
      emit("stderr", "error", message, fields);
    },
  };
}

/**
 * Wraps a script body so unhandled errors produce a single structured stderr
 * line and a non-zero exit code, instead of a noisy unhandled-rejection trace.
 */
export async function runScript(
  name: string,
  body: (ctx: { logger: ScriptLogger }) => Promise<void>,
): Promise<void> {
  const logger = createScriptLogger(name);
  const startedAt = Date.now();
  try {
    await body({ logger });
    logger.info("script.completed", { durationMs: Date.now() - startedAt });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const stack = error instanceof Error ? error.stack : undefined;
    logger.error("script.failed", {
      durationMs: Date.now() - startedAt,
      errorMessage: message,
      ...(stack !== undefined ? { stack } : {}),
    });
    process.exitCode = 1;
  }
}
