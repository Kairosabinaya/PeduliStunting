/**
 * Single source for mapping a domain {@link AppError} to a UI treatment
 * (project guidelines §12). Components render errors through this switch instead of
 * inventing ad-hoc error UI. Copy is Bahasa Indonesia.
 */

import type { AppError } from "@/domain/errors/app-error";

export type ErrorTreatment = "inline" | "redirect-signin" | "full" | "toast";

export interface ErrorUi {
  readonly title: string;
  readonly description: string;
  readonly treatment: ErrorTreatment;
}

/** Map an {@link AppError} to a title, description, and treatment for the UI. */
export function mapAppErrorToUi(error: AppError): ErrorUi {
  switch (error.kind) {
    case "validation":
      return {
        title: "Input tidak valid",
        description: error.message,
        treatment: "inline",
      };
    case "unauthorized":
      return {
        title: "Perlu masuk",
        description: error.message,
        treatment: "redirect-signin",
      };
    case "forbidden":
      return {
        title: "Akses ditolak",
        description: error.message,
        treatment: "full",
      };
    case "not_found":
      return {
        title: "Tidak ditemukan",
        description: error.message,
        treatment: "full",
      };
    case "conflict":
      return {
        title: "Terjadi konflik",
        description: error.message,
        treatment: "inline",
      };
    case "rate_limit":
      return {
        title: "Terlalu banyak permintaan",
        description: error.message,
        treatment: "toast",
      };
    case "external_service":
      return {
        title: "Layanan sedang bermasalah",
        description: error.message,
        treatment: "full",
      };
    case "unexpected":
      return {
        title: "Terjadi kesalahan",
        description: error.message,
        treatment: "full",
      };
  }
}
