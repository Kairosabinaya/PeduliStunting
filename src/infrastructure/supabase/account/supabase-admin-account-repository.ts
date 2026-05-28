import "server-only";

import { AppErrors, type AppError } from "@/domain/errors/app-error";
import { err, ok, type Result } from "@/domain/shared/result";
import { asUserId, type UserId } from "@/domain/shared/ids";
import type {
  AdminAccount,
  AdminAccountRepository,
} from "@/domain/account/ports/admin-account-repository";
import {
  USER_ROLES,
  type UserRole,
} from "@/domain/account/entities/user-profile";
import { getLogger } from "@/infrastructure/logger/pino-logger";

import type { TypedSupabaseClient } from "../server-client";
import {
  mapPostgrestError,
  mapUnknownInfrastructureError,
} from "../error-mapping";

/**
 * Supabase admin client implementation of {@link AdminAccountRepository}.
 * Always pass the service-role admin client — the methods touch
 * `auth.users` (delete) and bypass RLS on `profiles` so they will fail
 * under the regular session client.
 */
export class SupabaseAdminAccountRepository implements AdminAccountRepository {
  constructor(private readonly adminClient: TypedSupabaseClient) {}

  async listAll(): Promise<Result<readonly AdminAccount[], AppError>> {
    try {
      // 1. Pull every auth user via the admin endpoint. A single page
      //    of 1000 covers the project for the foreseeable future; we
      //    revisit pagination once the user base outgrows it.
      const { data: usersData, error: usersError } =
        await this.adminClient.auth.admin.listUsers({
          page: 1,
          perPage: 1000,
        });
      if (usersError) {
        getLogger().error("admin.listUsers failed", {
          message: usersError.message,
        });
        return err(
          AppErrors.externalService(
            usersError.message || "Supabase admin error",
            "supabase-auth",
            usersError,
          ),
        );
      }

      const users = usersData?.users ?? [];
      if (users.length === 0) return ok([]);

      // 2. Fetch matching profile rows in a single round trip. The
      //    admin client bypasses RLS so we see every row.
      const userIds = users.map((u) => u.id);
      const { data: profilesData, error: profilesError } =
        await this.adminClient
          .from("profiles")
          .select("user_id, display_name, avatar_url, role")
          .in("user_id", userIds);
      if (profilesError) {
        return err(mapPostgrestError(profilesError, "profiles"));
      }
      const profileByUserId = new Map(
        (profilesData ?? []).map((row) => [row.user_id, row] as const),
      );

      const accounts: AdminAccount[] = users
        .map((user): AdminAccount => {
          const profile = profileByUserId.get(user.id);
          return {
            userId: asUserId(user.id),
            email: user.email ?? null,
            displayName: profile?.display_name ?? null,
            avatarUrl: profile?.avatar_url ?? null,
            role: coerceRole(profile?.role),
            emailConfirmedAt: user.email_confirmed_at ?? null,
            createdAt: user.created_at ?? new Date().toISOString(),
            lastSignInAt: user.last_sign_in_at ?? null,
          };
        })
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

      return ok(accounts);
    } catch (cause) {
      return err(mapUnknownInfrastructureError(cause, "admin.listAll"));
    }
  }

  async deleteAccount(userId: UserId): Promise<Result<void, AppError>> {
    try {
      const { error } = await this.adminClient.auth.admin.deleteUser(
        userId,
        // `shouldSoftDelete = false` (default) — we want the cascade to
        // remove the profile row right away so the same email can be
        // registered again.
      );
      if (error) {
        getLogger().error("admin.deleteUser failed", {
          userId,
          message: error.message,
        });
        return err(
          AppErrors.externalService(
            error.message || "Supabase admin error",
            "supabase-auth",
            error,
          ),
        );
      }
      return ok(undefined);
    } catch (cause) {
      return err(mapUnknownInfrastructureError(cause, "admin.deleteAccount"));
    }
  }
}

function coerceRole(value: string | null | undefined): UserRole {
  if (value && (USER_ROLES as readonly string[]).includes(value)) {
    return value as UserRole;
  }
  return "user";
}
