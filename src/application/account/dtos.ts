import type {
  ThemePreference,
  UserProfile,
  UserRole,
} from "@/domain/account/entities/user-profile";

export interface UserProfileDto {
  readonly userId: string;
  readonly displayName: string | null;
  readonly role: UserRole;
  readonly themePreference: ThemePreference;
  readonly locale: string;
}

export function toUserProfileDto(profile: UserProfile): UserProfileDto {
  return {
    userId: profile.userId,
    displayName: profile.displayName,
    role: profile.role,
    themePreference: profile.themePreference,
    locale: profile.locale,
  };
}
