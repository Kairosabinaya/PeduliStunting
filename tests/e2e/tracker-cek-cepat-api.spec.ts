import { expect, test } from "@playwright/test";

/**
 * Kontrak API `POST /api/tracker/cek-cepat`.
 *
 * Endpoint ini MEWAJIBKAN sesi terautentikasi: handler membaca
 * `growth_standards` yang RLS-nya readable hanya untuk role authenticated
 * (lihat komentar di `src/app/api/tracker/cek-cepat/route.ts`). Komentar spec
 * lama menganggap endpoint publik — itu ditulis sebelum keputusan RLS dan
 * tidak pernah cocok dengan implementasinya, sehingga seluruh suite anon-400
 * gagal permanen.
 *
 * Tanpa user ter-seed, kontrak yang BISA diverifikasi anonim adalah respons
 * 401 ber-bentuk `{ ok: false, error }` untuk setiap request tanpa sesi,
 * apa pun bentuk payload-nya. Test validasi Zod (400) dan happy-path (200)
 * menyusul saat ada fixture autentikasi e2e.
 */

const ENDPOINT = "/api/tracker/cek-cepat";

test.describe("POST /api/tracker/cek-cepat (anonymous)", () => {
  test("rejects non-JSON body with 401 before validation", async ({
    request,
  }) => {
    const response = await request.post(ENDPOINT, {
      data: "not json",
      headers: { "Content-Type": "text/plain" },
    });
    expect(response.status()).toBe(401);
    const body = (await response.json()) as { ok: boolean };
    expect(body.ok).toBe(false);
  });

  test("rejects a well-formed payload with 401 when unauthenticated", async ({
    request,
  }) => {
    const response = await request.post(ENDPOINT, {
      data: {
        sex: "L",
        ageMonths: 12,
        weightKg: 9.5,
        heightCm: 75,
      },
    });
    expect(response.status()).toBe(401);
    const body = (await response.json()) as { ok: boolean };
    expect(body.ok).toBe(false);
  });
});
