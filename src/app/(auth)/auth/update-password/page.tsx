import type { Metadata } from "next";
import Link from "next/link";

import { AuthSectionHeader } from "@/app/(auth)/_components/auth-section-header";
import { UPDATE_PASSWORD_COPY } from "@/config/auth";

import { UpdatePasswordForm } from "./update-password-form";

export const metadata: Metadata = {
  title: UPDATE_PASSWORD_COPY.metaTitle,
  description: UPDATE_PASSWORD_COPY.description,
};

export default function UpdatePasswordPage() {
  return (
    <div className="space-y-6">
      <AuthSectionHeader
        eyebrow={UPDATE_PASSWORD_COPY.eyebrow}
        title={UPDATE_PASSWORD_COPY.title}
        description={UPDATE_PASSWORD_COPY.description}
      />
      <UpdatePasswordForm />
      <p className="text-sm text-muted-foreground">
        <Link
          href={UPDATE_PASSWORD_COPY.footerLink.href}
          className="font-medium text-primary hover:underline focus-visible:underline focus-visible:outline-none"
        >
          {UPDATE_PASSWORD_COPY.footerLink.label}
        </Link>
      </p>
    </div>
  );
}
