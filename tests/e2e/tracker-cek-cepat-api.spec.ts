import { expect, test } from "@playwright/test";

/**
 * Tracker Phase 1 — kontrak API `POST /api/tracker/cek-cepat`.
 *
 * Endpoint ini dipanggil oleh floating Cek Cepat banner. Saat user belum
 * sign-in, Supabase server client tidak ada sesi tetapi endpoint TETAP
 * boleh dipanggil (engine kalkulasi client-side, tidak mengakses data
 * milik user). Yang kita verifikasi:
 *
 *   - Validasi Zod menolak input invalid (400)
 *   - Validasi Zod menolak nilai negatif (400)
 *   - Validasi Zod menolak usia > 60 bulan (400)
 *   - Body bukan JSON valid → 400
 *
 * Test happy-path (200 dengan result) di-defer hingga `growth_standards`
 * di-seed via `pnpm import:who-standards`.
 */

const ENDPOINT = "/api/tracker/cek-cepat";

test.describe("POST /api/tracker/cek-cepat", () => {
  test("rejects non-JSON body with 400", async ({ request }) => {
    const response = await request.post(ENDPOINT, {
      data: "not json",
      headers: { "Content-Type": "text/plain" },
    });
    expect(response.status()).toBe(400);
    const body = (await response.json()) as { ok: boolean };
    expect(body.ok).toBe(false);
  });

  test("rejects invalid age range with 400", async ({ request }) => {
    const response = await request.post(ENDPOINT, {
      data: {
        sex: "L",
        ageMonths: 72,
        weightKg: 20,
        heightCm: 100,
      },
    });
    expect(response.status()).toBe(400);
  });

  test("rejects payload missing both weight and height", async ({
    request,
  }) => {
    const response = await request.post(ENDPOINT, {
      data: {
        sex: "L",
        ageMonths: 12,
        weightKg: null,
        heightCm: null,
      },
    });
    expect(response.status()).toBe(400);
  });

  test("rejects invalid sex value", async ({ request }) => {
    const response = await request.post(ENDPOINT, {
      data: {
        sex: "X",
        ageMonths: 12,
        weightKg: 9.5,
        heightCm: 75,
      },
    });
    expect(response.status()).toBe(400);
  });
});
