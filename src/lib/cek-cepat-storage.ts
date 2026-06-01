"use client";

import { z } from "zod";

import { CEK_CEPAT_STORAGE_KEY } from "@/config/cek-cepat";

/**
 * Persisted state for the floating Cek Cepat banner. Stored in `localStorage`
 * under {@link CEK_CEPAT_STORAGE_KEY} so the user can minimise the widget,
 * navigate around `/tracker`, and come back to the same inputs without
 * re-entering them.
 *
 * Schema is versioned via the storage key suffix (`-v1`). Bumping the suffix
 * forces a clean read; do that whenever the schema changes incompatibly.
 */
export const cekCepatStoredStateSchema = z.object({
  collapsed: z.boolean(),
  inputs: z
    .object({
      sex: z.union([z.literal("L"), z.literal("P")]).nullable(),
      mode: z.union([z.literal("birth-date"), z.literal("age-months")]),
      birthDate: z.string().nullable(),
      ageMonths: z.union([z.number().int(), z.string()]).nullable(),
      weightKg: z.union([z.number(), z.string()]).nullable(),
      heightCm: z.union([z.number(), z.string()]).nullable(),
    })
    .nullable(),
});

export type CekCepatStoredState = z.infer<typeof cekCepatStoredStateSchema>;

export const DEFAULT_CEK_CEPAT_STATE: CekCepatStoredState = {
  collapsed: false,
  inputs: null,
};

export function readCekCepatState(): CekCepatStoredState {
  if (typeof window === "undefined") {
    return DEFAULT_CEK_CEPAT_STATE;
  }
  try {
    const raw = window.localStorage.getItem(CEK_CEPAT_STORAGE_KEY);
    if (!raw) return DEFAULT_CEK_CEPAT_STATE;
    const parsed = cekCepatStoredStateSchema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : DEFAULT_CEK_CEPAT_STATE;
  } catch {
    return DEFAULT_CEK_CEPAT_STATE;
  }
}

export function writeCekCepatState(state: CekCepatStoredState): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CEK_CEPAT_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Quota exceeded or storage disabled — silently ignore. The banner
    // continues to work in-memory for this session.
  }
}
