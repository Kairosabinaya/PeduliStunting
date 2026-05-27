import type { UserId } from "@/domain/shared/ids";

export const USER_ROLES = ["user", "admin"] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const THEME_PREFERENCES = ["system", "light", "dark"] as const;
export type ThemePreference = (typeof THEME_PREFERENCES)[number];

export class UserProfile {
  readonly userId: UserId;
  readonly displayName: string | null;
  readonly role: UserRole;
  readonly themePreference: ThemePreference;
  readonly locale: string;

  constructor(props: {
    userId: UserId;
    displayName: string | null;
    role: UserRole;
    themePreference: ThemePreference;
    locale: string;
  }) {
    this.userId = props.userId;
    this.displayName = props.displayName;
    this.role = props.role;
    this.themePreference = props.themePreference;
    this.locale = props.locale;
  }

  isAdmin(): boolean {
    return this.role === "admin";
  }
}
