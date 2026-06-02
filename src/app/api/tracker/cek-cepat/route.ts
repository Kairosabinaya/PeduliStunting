import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import { makeUseCases } from "@/composition";
import { AppErrors, appErrorToHttpStatus } from "@/domain/errors/app-error";
import { createSupabaseServerClient } from "@/infrastructure/supabase/server-client";
import { tryServerSession } from "@/lib/server-session";

export const dynamic = "force-dynamic";

const RequestSchema = z
  .object({
    sex: z.enum(["L", "P"]),
    ageMonths: z.number().int().min(0).max(60),
    weightKg: z.number().positive().max(50).nullable(),
    heightCm: z.number().positive().max(150).nullable(),
  })
  .strict()
  .refine(
    (data) => data.weightKg !== null || data.heightCm !== null,
    "Minimal salah satu dari berat atau tinggi badan harus diisi.",
  );

/**
 * Runs the user-supplied screening inputs through the domain calculator and
 * returns z-scores plus Buku KIA SD classifications. The endpoint requires an
 * authenticated session (it reads RLS-protected WHO standards) but does not
 * require any stored child profile — it is the backend of the floating "Cek
 * Cepat" banner mounted at `/tracker/**`. Authentication is verified here, not
 * only at the proxy (project guidelines Section 6).
 *
 * The handler returns a Result-shape JSON `{ ok, value?, error? }` so client
 * code can branch with the same convention used by Server Actions.
 */
export async function POST(request: NextRequest) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return Response.json(
      {
        ok: false,
        error: AppErrors.validation("Body harus JSON yang valid."),
      },
      { status: 400 },
    );
  }

  const parsed = RequestSchema.safeParse(payload);
  if (!parsed.success) {
    return Response.json(
      {
        ok: false,
        error: AppErrors.validation(
          parsed.error.issues[0]?.message ?? "Input tidak valid.",
        ),
      },
      { status: 400 },
    );
  }

  const session = await tryServerSession();
  if (!session) {
    const error = AppErrors.unauthorized();
    return Response.json(
      { ok: false, error },
      { status: appErrorToHttpStatus(error) },
    );
  }

  let client;
  try {
    client = await createSupabaseServerClient();
  } catch (cause) {
    return Response.json(
      {
        ok: false,
        error: AppErrors.unexpected(
          "Layanan tidak tersedia.",
          cause instanceof Error ? cause : undefined,
        ),
      },
      { status: 503 },
    );
  }

  const useCases = makeUseCases(client);
  const result = await useCases.computeQuickScreening.execute(parsed.data);

  if (!result.ok) {
    return Response.json(
      { ok: false, error: result.error },
      { status: appErrorToHttpStatus(result.error) },
    );
  }

  return NextResponse.json({ ok: true, value: result.value });
}
