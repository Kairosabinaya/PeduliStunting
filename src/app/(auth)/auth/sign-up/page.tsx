import type { Metadata } from "next";
import Link from "next/link";

import { AuthSectionHeader } from "@/app/(auth)/_components/auth-section-header";
import { AuthStepper } from "@/app/(auth)/_components/auth-stepper";
import { SIGN_UP_COPY } from "@/config/auth";

import { SignUpForm } from "./sign-up-form";

export const metadata: Metadata = {
  title: SIGN_UP_COPY.metaTitle,
  description: SIGN_UP_COPY.description,
};

interface SignUpPageProps {
  readonly searchParams: Promise<{ redirect?: string }>;
}

export default async function SignUpPage({ searchParams }: SignUpPageProps) {
  const { redirect } = await searchParams;

  return (
    <div className="space-y-8" data-auth-wide>
      <AuthSectionHeader
        eyebrow={SIGN_UP_COPY.eyebrow}
        title={SIGN_UP_COPY.title}
        description={SIGN_UP_COPY.description}
      >
        <AuthStepper currentStep={1} />
      </AuthSectionHeader>
      <SignUpForm redirectTo={redirect} />
      <p className="text-sm text-muted-foreground">
        {SIGN_UP_COPY.footerPrompt}{" "}
        <Link
          href={SIGN_UP_COPY.footerLink.href}
          className="font-medium text-primary hover:underline focus-visible:underline focus-visible:outline-none"
        >
          {SIGN_UP_COPY.footerLink.label}
        </Link>
        .
      </p>
    </div>
  );
}
