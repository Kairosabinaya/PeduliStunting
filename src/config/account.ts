/**
 * Copy, option lists, and routing constants for the `/account` route. Keeps
 * the Server Component, Server Action, and client form free of magic strings
 * and lets us audit every label in one place.
 *
 * The underlying domain values (`THEME_PREFERENCES`, `USER_ROLES`) live in the
 * account entity; this module only attaches presentation labels and hints.
 */

import {
  THEME_PREFERENCES,
  type ThemePreference,
  type UserRole,
} from "@/domain/account/entities/user-profile";
import { SUPPORTED_LOCALES, type SupportedLocale } from "./locales";

export const ACCOUNT_ROUTE = "/account";

export const ACCOUNT_PAGE_COPY = {
  metaTitle: "Akun",
  eyebrow: "AKUN & TAMPILAN",
  title: "Akun saya",
  description: "Atur nama tampilan, foto profil, tema, dan akses akun Anda.",
} as const;

export const ACCOUNT_FORM_COPY = {
  cardTitle: "Profil pengguna",
  cardDescription: "Perubahan akan diterapkan di seluruh halaman aplikasi.",
  displayNameLabel: "Nama tampilan",
  displayNamePlaceholder: "Mis. Bunda Aira",
  displayNameHint:
    "Tampil di header dan sapaan aplikasi. Boleh memakai nama panggilan.",
  themeLabel: "Tema tampilan",
  themeHint:
    "Mengikuti sistem berarti tema menyesuaikan pengaturan terang atau gelap di perangkat Anda.",
  submit: "Simpan perubahan",
  resetDirty: "Batalkan",
  successMessage: "Perubahan profil berhasil disimpan.",
} as const;

export const ACCOUNT_DETAILS_COPY = {
  cardTitle: "Detail akun",
  cardDescription: "Informasi akun yang sedang digunakan untuk masuk.",
  emailLabel: "Email",
  emailMissing: "Email tidak tersedia",
  userIdLabel: "ID pengguna",
} as const;

export const ACCOUNT_SIGN_OUT_COPY = {
  triggerLabel: "Keluar dari akun",
  dialogTitle: "Keluar dari akun?",
  dialogDescription:
    "Anda akan keluar dari perangkat ini. Data tetap tersimpan di akun Anda.",
  confirmLabel: "Ya, keluar",
  cancelLabel: "Batal",
} as const;

export const ACCOUNT_EMPTY_STATE_COPY = {
  title: "Profil belum lengkap",
  description:
    "Catatan profil belum tersedia untuk akun ini. Coba muat ulang halaman; jika tetap kosong, hubungi dukungan.",
  refreshLabel: "Muat ulang",
} as const;

export const ACCOUNT_ERROR_STATE_COPY = {
  title: "Tidak bisa memuat profil",
  description:
    "Terjadi kendala saat mengambil data profil Anda. Periksa koneksi lalu coba lagi.",
} as const;

export const ACCOUNT_GENERIC_ERROR =
  "Terjadi kesalahan saat menyimpan. Coba lagi sebentar.";

export interface ThemeOption {
  readonly value: ThemePreference;
  readonly label: string;
}

/** Display order is meaningful (system first as the safe default). */
export const THEME_OPTIONS: readonly ThemeOption[] = THEME_PREFERENCES.map(
  (value) => ({
    value,
    label:
      value === "system"
        ? "Mengikuti sistem"
        : value === "light"
          ? "Terang"
          : "Gelap",
  }),
);

export interface LocaleOption {
  readonly value: SupportedLocale;
  readonly label: string;
}

export const LOCALE_OPTIONS: readonly LocaleOption[] = SUPPORTED_LOCALES.map(
  (value) => ({
    value,
    label: value === "id-ID" ? "Bahasa Indonesia" : value,
  }),
);

export const ROLE_LABEL: Readonly<Record<UserRole, string>> = {
  user: "Pengguna",
  admin: "Administrator",
};

export const THEME_LABEL: Readonly<Record<ThemePreference, string>> =
  Object.fromEntries(THEME_OPTIONS.map((o) => [o.value, o.label])) as Readonly<
    Record<ThemePreference, string>
  >;
