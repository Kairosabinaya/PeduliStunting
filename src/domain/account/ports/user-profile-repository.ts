import type { AppError } from "@/domain/errors/app-error";
import type { Result } from "@/domain/shared/result";
import type { UserId } from "@/domain/shared/ids";
import type { ThemePreference, UserProfile } from "../entities/user-profile";

export interface UserProfileRepository {
  findByUserId(userId: UserId): Promise<Result<UserProfile | null, AppError>>;
  updatePreferences(input: {
    userId: UserId;
    displayName: string | null;
    themePreference: ThemePreference;
    locale: string;
  }): Promise<Result<UserProfile, AppError>>;
  updateAvatar(input: {
    userId: UserId;
    avatarUrl: string | null;
  }): Promise<Result<UserProfile, AppError>>;
}
