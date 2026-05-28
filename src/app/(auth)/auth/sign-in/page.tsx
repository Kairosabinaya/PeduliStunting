import type { Metadata } from "next";
import Link from "next/link";

import { AuthSectionHeader } from "@/app/(auth)/_components/auth-section-header";
import { SIGN_IN_COPY } from "@/config/auth";

import { SignInForm } from "./sign-in-form";

export const metadata: Metadata = {
  title: SIGN_IN_COPY.metaTitle,
  description: SIGN_IN_COPY.description,
};

interface SignInPageProps {
  readonly searchParams: Promise<{
    redirect?: string;
    error?: string;
  }>;
}

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const { redirect, error } = await searchParams;

  return (
    <div className="space-y-6">
      <AuthSectionHeader
        eyebrow={SIGN_IN_COPY.eyebrow}
        title={SIGN_IN_COPY.title}
        description={SIGN_IN_COPY.description}
      />
      <SignInForm redirectTo={redirect} errorCode={error} />
      <p className="text-sm text-muted-foreground">
        {SIGN_IN_COPY.footerPrompt}{" "}
        <Link
          href={SIGN_IN_COPY.footerLink.href}
          className="font-medium text-primary hover:underline focus-visible:underline focus-visible:outline-none"
        >
          {SIGN_IN_COPY.footerLink.label}
        </Link>
        .
      </p>
    </div>
  );
}
