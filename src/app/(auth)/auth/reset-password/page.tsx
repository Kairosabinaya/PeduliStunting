import type { Metadata } from "next";
import Link from "next/link";

import { AuthSectionHeader } from "@/app/(auth)/_components/auth-section-header";
import { RESET_PASSWORD_COPY } from "@/config/auth";

import { ResetPasswordForm } from "./reset-password-form";

export const metadata: Metadata = {
  title: RESET_PASSWORD_COPY.metaTitle,
  description: RESET_PASSWORD_COPY.description,
};

export default function ResetPasswordPage() {
  return (
    <div className="space-y-8">
      <AuthSectionHeader
        eyebrow={RESET_PASSWORD_COPY.eyebrow}
        title={RESET_PASSWORD_COPY.title}
        description={RESET_PASSWORD_COPY.description}
      />
      <ResetPasswordForm />
      <p className="text-sm text-muted-foreground">
        {RESET_PASSWORD_COPY.footerPrompt}{" "}
        <Link
          href={RESET_PASSWORD_COPY.footerLink.href}
          className="font-medium text-primary hover:underline focus-visible:underline focus-visible:outline-none"
        >
          {RESET_PASSWORD_COPY.footerLink.label}
        </Link>
        .
      </p>
    </div>
  );
}
