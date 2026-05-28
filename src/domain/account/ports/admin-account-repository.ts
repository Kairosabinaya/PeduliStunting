import type { AppError } from "@/domain/errors/app-error";
import type { Result } from "@/domain/shared/result";
import type { UserId } from "@/domain/shared/ids";

import type { UserRole } from "../entities/user-profile";

/**
 * Snapshot of a single account combining `auth.users` identity columns
 * with the `profiles` row. Lives in the domain because the admin
 * dashboard reads this shape as-is; use cases produce it via the port
 * implementation that joins both tables under the admin client.
 */
export interface AdminAccount {
  readonly userId: UserId;
  readonly email: string | null;
  readonly displayName: string | null;
  readonly avatarUrl: string | null;
  readonly role: UserRole;
  readonly emailConfirmedAt: string | null;
  readonly createdAt: string;
  readonly lastSignInAt: string | null;
}

/**
 * Port for admin-only account management. Implementations require the
 * service-role admin Supabase client because they touch `auth.users`
 * directly (delete) and bypass RLS on `profiles` for the list query.
 *
 * See ADR-0008 for the broader rationale around isolating admin paths.
 */
export interface AdminAccountRepository {
  /**
   * Lists every account in the system sorted by `created_at` desc.
   * No pagination yet — fine while the user base is small; revisit
   * when it grows past a few hundred.
   */
  listAll(): Promise<Result<readonly AdminAccount[], AppError>>;

  /**
   * Hard-deletes the underlying `auth.users` row. The `profiles` row
   * goes away through the `ON DELETE CASCADE` foreign key.
   */
  deleteAccount(userId: UserId): Promise<Result<void, AppError>>;
}
