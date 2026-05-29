import type { Metadata } from "next";
import Link from "next/link";

import { AuthSectionHeader } from "@/app/(auth)/_components/auth-section-header";
import { AuthStepper } from "@/app/(auth)/_components/auth-stepper";
import { CHECK_EMAIL_COPY } from "@/config/auth";

import { CheckEmailForm } from "./check-email-form";

export const metadata: Metadata = {
  title: CHECK_EMAIL_COPY.metaTitle,
  description: CHECK_EMAIL_COPY.description,
};

interface CheckEmailPageProps {
  readonly searchParams: Promise<{
    email?: string;
    redirect?: string;
  }>;
}

export default async function CheckEmailPage({
  searchParams,
}: CheckEmailPageProps) {
  const { email, redirect } = await searchParams;

  return (
    <div className="space-y-6">
      <AuthSectionHeader
        eyebrow={CHECK_EMAIL_COPY.eyebrow}
        title={CHECK_EMAIL_COPY.title}
        description={CHECK_EMAIL_COPY.description}
      >
        <AuthStepper currentStep={2} />
      </AuthSectionHeader>

      <CheckEmailForm email={email ?? ""} redirectTo={redirect ?? ""} />

      <p className="text-sm text-muted-foreground">
        {CHECK_EMAIL_COPY.footerPrompt}{" "}
        <Link
          href={CHECK_EMAIL_COPY.footerLink.href}
          className="font-medium text-primary hover:underline focus-visible:underline focus-visible:outline-none"
        >
          {CHECK_EMAIL_COPY.footerLink.label}
        </Link>
        .
      </p>
    </div>
  );
}
