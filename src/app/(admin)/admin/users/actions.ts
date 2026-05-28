"use server";

import { revalidatePath } from "next/cache";

import { asUserId } from "@/domain/shared/ids";
import { makeAdminUseCases } from "@/composition";
import { ADMIN_USERS_ROUTE } from "@/config/routes";
import { createSupabaseAdminClient } from "@/infrastructure/supabase/server-client";
import { requireServerSession } from "@/lib/server-session";

import type { DeleteUserAccountFormState } from "./_lib/delete-state";

/**
 * Delete an arbitrary account from the admin dashboard. The Server
 * Action re-checks the actor's session before delegating; the layout
 * guard already verified the admin role on the way in.
 */
export async function deleteUserAccountAction(
  _previous: DeleteUserAccountFormState | null,
  formData: FormData,
): Promise<DeleteUserAccountFormState> {
  const rawTarget = formData.get("targetUserId");
  if (typeof rawTarget !== "string" || rawTarget.length === 0) {
    return { ok: false, message: "Target pengguna tidak valid." };
  }

  const session = await requireServerSession();
  const targetUserId = asUserId(rawTarget);

  let admin;
  try {
    admin = createSupabaseAdminClient();
  } catch (cause) {
    return {
      ok: false,
      message:
        cause instanceof Error
          ? cause.message
          : "Admin client tidak tersedia. Pastikan SUPABASE_SERVICE_ROLE_KEY tersetel.",
    };
  }

  const { deleteUserAccount } = makeAdminUseCases(admin);
  const result = await deleteUserAccount.execute({
    actorUserId: session.userId,
    targetUserId,
  });

  if (!result.ok) {
    return { ok: false, message: result.error.message };
  }

  revalidatePath(ADMIN_USERS_ROUTE);
  return { ok: true };
}
