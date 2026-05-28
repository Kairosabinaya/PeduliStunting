import type { AdminAccount } from "@/domain/account/ports/admin-account-repository";
import type {
  ThemePreference,
  UserProfile,
  UserRole,
} from "@/domain/account/entities/user-profile";

export interface UserProfileDto {
  readonly userId: string;
  readonly displayName: string | null;
  readonly avatarUrl: string | null;
  readonly role: UserRole;
  readonly themePreference: ThemePreference;
  readonly locale: string;
}

export function toUserProfileDto(profile: UserProfile): UserProfileDto {
  return {
    userId: profile.userId,
    displayName: profile.displayName,
    avatarUrl: profile.avatarUrl,
    role: profile.role,
    themePreference: profile.themePreference,
    locale: profile.locale,
  };
}

/* ───────────────────────────── Admin DTOs ───────────────────────────── */

export interface AdminAccountDto {
  readonly userId: string;
  readonly email: string | null;
  readonly displayName: string | null;
  readonly avatarUrl: string | null;
  readonly role: UserRole;
  readonly emailConfirmedAt: string | null;
  readonly createdAt: string;
  readonly lastSignInAt: string | null;
}

export function toAdminAccountDto(account: AdminAccount): AdminAccountDto {
  return {
    userId: account.userId,
    email: account.email,
    displayName: account.displayName,
    avatarUrl: account.avatarUrl,
    role: account.role,
    emailConfirmedAt: account.emailConfirmedAt,
    createdAt: account.createdAt,
    lastSignInAt: account.lastSignInAt,
  };
}
