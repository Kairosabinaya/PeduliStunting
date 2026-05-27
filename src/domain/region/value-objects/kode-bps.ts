import type { Brand } from "@/domain/shared/brand";

/**
 * BPS region identifier for kabupaten/kota.
 *
 * Always exactly four numeric characters (`"1101"`, `"3201"` ...). This format
 * matches `regions.kode_bps` in the database and is enforced by Postgres CHECK
 * and Zod parsing at the boundary.
 */
export type KodeBps = Brand<string, "KodeBps">;

const KODE_BPS_RE = /^\d{4}$/;

export function isKodeBps(value: string): value is KodeBps {
  return KODE_BPS_RE.test(value);
}

export function asKodeBps(value: string): KodeBps {
  if (!isKodeBps(value)) {
    throw new Error(`Invalid KodeBps: ${value}`);
  }
  return value as KodeBps;
}
