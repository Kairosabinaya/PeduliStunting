import type { Metadata } from "next";
import Link from "next/link";

import { RESET_PASSWORD_COPY } from "@/config/auth";

import { ResetPasswordForm } from "./reset-password-form";

export const metadata: Metadata = {
  title: RESET_PASSWORD_COPY.metaTitle,
  description: RESET_PASSWORD_COPY.description,
};

export default function ResetPasswordPage() {
  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold text-foreground sm:text-3xl">
          {RESET_PASSWORD_COPY.title}
        </h1>
        <p className="text-sm text-muted-foreground">
          {RESET_PASSWORD_COPY.description}
        </p>
      </header>
      <ResetPasswordForm />
      <p className="text-sm text-muted-foreground">
        {RESET_PASSWORD_COPY.footerPrompt}{" "}
        <Link
          href={RESET_PASSWORD_COPY.footerLink.href}
          className="font-medium text-primary hover:underline focus-visible:outline-none focus-visible:underline"
        >
          {RESET_PASSWORD_COPY.footerLink.label}
        </Link>
        .
      </p>
    </div>
  );
}
