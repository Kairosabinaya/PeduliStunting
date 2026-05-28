import { z } from "zod";

import { AvatarPendingPathSchema } from "./avatar";

/**
 * Auth boundary schemas. Server Actions consume these to validate FormData
 * before talking to Supabase Auth. Constants are single-sourced here so the
 * UI hint copy and the validator agree on the same limits.
 *
 * Supabase Auth itself enforces a 72-byte ceiling on bcrypt-hashed passwords;
 * we surface the same limit in the schema so the error appears inline rather
 * than as a generic 422 from the API.
 */
export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 72;
export const DISPLAY_NAME_MIN_LENGTH = 2;
export const DISPLAY_NAME_MAX_LENGTH = 80;

const emailSchema = z
  .string()
  .min(1, "Email wajib diisi.")
  .email("Format email tidak valid.");

const passwordSchema = z
  .string()
  .min(
    PASSWORD_MIN_LENGTH,
    `Kata sandi minimal ${PASSWORD_MIN_LENGTH} karakter.`,
  )
  .max(
    PASSWORD_MAX_LENGTH,
    `Kata sandi maksimal ${PASSWORD_MAX_LENGTH} karakter.`,
  );

const displayNameSchema = z
  .string()
  .min(
    DISPLAY_NAME_MIN_LENGTH,
    `Nama tampilan minimal ${DISPLAY_NAME_MIN_LENGTH} karakter.`,
  )
  .max(
    DISPLAY_NAME_MAX_LENGTH,
    `Nama tampilan maksimal ${DISPLAY_NAME_MAX_LENGTH} karakter.`,
  );

const redirectToSchema = z.string().optional();

export const SignInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Kata sandi wajib diisi."),
  redirectTo: redirectToSchema,
});

export const SignUpSchema = z
  .object({
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Konfirmasi kata sandi wajib diisi."),
    displayName: displayNameSchema,
    avatarPendingPath: AvatarPendingPathSchema.optional(),
    redirectTo: redirectToSchema,
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Konfirmasi kata sandi tidak sama.",
    path: ["confirmPassword"],
  });

export const RequestPasswordResetSchema = z.object({
  email: emailSchema,
});

export const UpdatePasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Konfirmasi kata sandi wajib diisi."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Konfirmasi kata sandi tidak sama.",
    path: ["confirmPassword"],
  });

export type SignInInput = z.infer<typeof SignInSchema>;
export type SignUpInput = z.infer<typeof SignUpSchema>;
export type RequestPasswordResetInput = z.infer<
  typeof RequestPasswordResetSchema
>;
export type UpdatePasswordInput = z.infer<typeof UpdatePasswordSchema>;
