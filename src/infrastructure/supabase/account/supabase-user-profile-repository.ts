import "server-only";
import { err, ok, type Result } from "@/domain/shared/result";
import type { AppError } from "@/domain/errors/app-error";
import type { UserId } from "@/domain/shared/ids";
import type {
  ThemePreference,
  UserProfile,
} from "@/domain/account/entities/user-profile";
import type { UserProfileRepository } from "@/domain/account/ports/user-profile-repository";
import { mapProfileRow } from "@/schemas/account";
import {
  mapPostgrestError,
  mapUnknownInfrastructureError,
} from "../error-mapping";
import type { TypedSupabaseClient } from "../server-client";

const SELECT_COLUMNS =
  "user_id, display_name, avatar_url, role, theme_preference, locale, created_at, updated_at";

export class SupabaseUserProfileRepository implements UserProfileRepository {
  constructor(private readonly client: TypedSupabaseClient) {}

  async findByUserId(
    userId: UserId,
  ): Promise<Result<UserProfile | null, AppError>> {
    try {
      const { data, error } = await this.client
        .from("profiles")
        .select(SELECT_COLUMNS)
        .eq("user_id", userId)
        .maybeSingle();
      if (error) return err(mapPostgrestError(error, "profiles"));
      if (data === null) return ok(null);
      const mapped = mapProfileRow(data);
      if (!mapped.ok) return err(mapped.error);
      return ok(mapped.value);
    } catch (cause) {
      return err(mapUnknownInfrastructureError(cause, "profiles.findByUserId"));
    }
  }

  async updatePreferences(input: {
    userId: UserId;
    displayName: string | null;
    themePreference: ThemePreference;
    locale: string;
  }): Promise<Result<UserProfile, AppError>> {
    try {
      const { data, error } = await this.client
        .from("profiles")
        .update({
          display_name: input.displayName,
          theme_preference: input.themePreference,
          locale: input.locale,
        })
        .eq("user_id", input.userId)
        .select(SELECT_COLUMNS)
        .single();
      if (error) return err(mapPostgrestError(error, "profiles"));
      const mapped = mapProfileRow(data);
      if (!mapped.ok) return err(mapped.error);
      return ok(mapped.value);
    } catch (cause) {
      return err(
        mapUnknownInfrastructureError(cause, "profiles.updatePreferences"),
      );
    }
  }

  async updateAvatar(input: {
    userId: UserId;
    avatarUrl: string | null;
  }): Promise<Result<UserProfile, AppError>> {
    try {
      const { data, error } = await this.client
        .from("profiles")
        .update({ avatar_url: input.avatarUrl })
        .eq("user_id", input.userId)
        .select(SELECT_COLUMNS)
        .single();
      if (error) return err(mapPostgrestError(error, "profiles"));
      const mapped = mapProfileRow(data);
      if (!mapped.ok) return err(mapped.error);
      return ok(mapped.value);
    } catch (cause) {
      return err(mapUnknownInfrastructureError(cause, "profiles.updateAvatar"));
    }
  }
}
