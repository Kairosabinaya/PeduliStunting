/**
 * Marketing and UX copy for the public auth flows. Centralising it here keeps
 * Server Components free of hardcoded strings and lets us audit every label a
 * visitor reads in one place (project guidelines §2.2). Updating copy never requires
 * touching component code.
 *
 * The actual auth backend is Supabase Auth; this file is the only source of
 * presentation copy that surrounds it.
 */

import { APP_NAME } from "./app";

export interface AuthFooterLink {
  readonly href: string;
  readonly label: string;
}

export interface AuthPageCopy {
  readonly metaTitle: string;
  readonly eyebrow: string;
  readonly title: string;
  readonly description: string;
  readonly footerPrompt: string;
  readonly footerLink: AuthFooterLink;
}

export const AUTH_EYEBROW = "Peduli Stunting" as const;

export interface AuthBrandPanel {
  readonly logo: {
    readonly src: string;
    readonly width: number;
    readonly height: number;
    readonly alt: string;
  };
  readonly headline: string;
  readonly body: string;
  readonly source: string;
}

export const AUTH_BRAND_PANEL: AuthBrandPanel = {
  logo: {
    src: "/brand/logo-stacked-white.png",
    width: 360,
    height: 360,
    alt: APP_NAME,
  },
  headline:
    "Data stunting nasional, edukasi Buku KIA, dan pemantauan pertumbuhan anak dalam satu aplikasi.",
  body: "Akun gratis. Data Anda tersimpan aman dan terikat pada profil keluarga.",
  source: "Sumber data: BPS, Susenas, dan Kemenkes RI.",
};

export const SIGN_IN_COPY: AuthPageCopy = {
  metaTitle: "Masuk",
  eyebrow: "Selamat datang kembali",
  title: "Masuk ke akun Anda",
  description: `Lanjutkan memantau pertumbuhan anak dan data stunting nasional bersama ${APP_NAME}.`,
  footerPrompt: "Belum memiliki akun?",
  footerLink: { href: "/auth/sign-up", label: "Daftar gratis" },
};

export const SIGN_UP_COPY: AuthPageCopy = {
  metaTitle: "Daftar",
  eyebrow: "Buat akun baru",
  title: "Mulai dengan satu langkah",
  description: `Bergabung gratis dengan ${APP_NAME}. Data Anda terenkripsi dan hanya bisa diakses oleh akun keluarga.`,
  footerPrompt: "Sudah memiliki akun?",
  footerLink: { href: "/auth/sign-in", label: "Masuk" },
};

export const RESET_PASSWORD_COPY: AuthPageCopy = {
  metaTitle: "Atur ulang kata sandi",
  eyebrow: "Lupa kata sandi",
  title: "Atur ulang kata sandi",
  description:
    "Masukkan email yang terdaftar. Kami akan mengirim tautan untuk membuat kata sandi baru.",
  footerPrompt: "Sudah ingat kata sandi?",
  footerLink: { href: "/auth/sign-in", label: "Kembali ke masuk" },
};

export const UPDATE_PASSWORD_COPY: AuthPageCopy = {
  metaTitle: "Kata sandi baru",
  eyebrow: "Konfirmasi pemulihan",
  title: "Buat kata sandi baru",
  description:
    "Tautan reset memverifikasi identitas Anda. Pilih kata sandi yang kuat dan mudah diingat.",
  footerPrompt: "",
  footerLink: { href: "/auth/sign-in", label: "Batal, kembali ke masuk" },
};

export const CHECK_EMAIL_COPY: AuthPageCopy = {
  metaTitle: "Verifikasi email",
  eyebrow: "Tinggal satu langkah",
  title: "Cek email Anda",
  description:
    "Kami sudah mengirim tautan verifikasi. Klik tautan tersebut untuk menyelesaikan pendaftaran.",
  footerPrompt: "Salah email?",
  footerLink: {
    href: "/auth/sign-up",
    label: "Daftar ulang dengan email lain",
  },
};

export const CHECK_EMAIL_LABELS = {
  resend: "Kirim ulang email verifikasi",
  resending: "Mengirim ulang...",
  resentSuccess:
    "Email verifikasi sudah dikirim ulang. Periksa kotak masuk dan folder spam.",
  cooldown: (seconds: number) =>
    `Tunggu ${String(seconds)} detik sebelum mengirim ulang.`,
  hint: "Tidak menemukan emailnya? Cek folder spam atau promosi.",
  emailSentTo: "Tautan terkirim ke",
  expiresHint:
    "Tautan berlaku selama 15 menit. Jika kadaluarsa, daftar ulang dengan email yang sama.",
} as const;

export const AUTH_LABELS = {
  signInSubmit: "Masuk",
  signUpSubmit: "Daftar",
  resetSubmit: "Kirim tautan reset",
  updateSubmit: "Simpan kata sandi baru",
  google: {
    signIn: "Lanjutkan dengan Google",
    signUp: "Daftar dengan Google",
  },
  forgotPassword: "Lupa kata sandi?",
  separator: "atau",
  email: "Email",
  password: "Kata sandi",
  confirmPassword: "Konfirmasi kata sandi",
  displayName: "Nama tampilan",
  emailPlaceholder: "anda@email.com",
  displayNamePlaceholder: "Nama lengkap atau panggilan",
  passwordHint: "Minimal 8 karakter, kombinasi huruf dan angka.",
  showPassword: "Tampilkan kata sandi",
  hidePassword: "Sembunyikan kata sandi",
  backToHome: "Kembali ke beranda",
  avatar: {
    label: "Foto profil",
    optional: "Opsional",
    hint: "JPG, PNG, atau WebP. Maksimal 2 MB.",
    upload: "Pilih foto",
    change: "Ganti foto",
    remove: "Hapus foto",
    uploading: "Mengunggah...",
    dropHere: "Lepaskan foto di sini",
    drag: "Tarik foto ke sini atau klik untuk pilih",
    previewAlt: "Pratinjau foto profil",
  },
  passwordStrength: {
    label: "Kekuatan kata sandi",
    weak: "Lemah",
    fair: "Cukup",
    good: "Bagus",
    strong: "Kuat",
  },
  stepper: {
    step1: "Isi data",
    step2: "Verifikasi email",
  },
  trustSignals: {
    encrypted: "Data terenkripsi end-to-end",
    free: "Gratis selamanya",
    official: "Konten Buku KIA Kemenkes RI",
  },
} as const;

export const AVATAR_VALIDATION_MESSAGES = {
  tooLarge: "Ukuran foto maksimal 2 MB.",
  tooSmall: "File foto terlalu kecil atau rusak.",
  mimeInvalid: "Format foto harus JPG, PNG, atau WebP.",
  uploadFailed: "Tidak bisa mengunggah foto. Silakan coba lagi.",
} as const;

export const AUTH_SUCCESS_MESSAGES = {
  signUpVerifyEmail:
    "Akun berhasil dibuat. Periksa email Anda untuk tautan verifikasi sebelum masuk.",
  resetLinkSent:
    "Bila email terdaftar, tautan reset sudah dikirim. Periksa kotak masuk dan folder spam.",
  passwordUpdated:
    "Kata sandi berhasil diperbarui. Anda akan diarahkan ke aplikasi.",
} as const;

/**
 * Friendly translations for the `?error=<code>` query parameter that auth
 * redirects (Google handshake, callback exchange, expired tokens) attach when
 * something fails before the form is rendered. Unknown codes fall back to a
 * generic message in the consumer rather than leaking the raw code.
 */
export const AUTH_ERROR_MESSAGES: Readonly<Record<string, string>> = {
  google: "Tidak bisa membuka layanan Google. Silakan coba lagi sebentar.",
  callback_failed: "Sesi tidak bisa diselesaikan. Silakan masuk ulang.",
  session_expired: "Sesi Anda telah berakhir. Masuk kembali untuk melanjutkan.",
  reset_token_invalid:
    "Tautan reset tidak valid atau sudah kadaluarsa. Silakan minta tautan baru.",
};

export const AUTH_FALLBACK_ERROR =
  "Terjadi kesalahan pada layanan masuk. Silakan coba lagi.";

export function getAuthErrorMessage(
  code: string | null | undefined,
): string | null {
  if (!code) return null;
  return AUTH_ERROR_MESSAGES[code] ?? AUTH_FALLBACK_ERROR;
}
