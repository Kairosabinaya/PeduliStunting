import type { Metadata } from "next";
import Link from "next/link";

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
      <header className="space-y-4">
        <AuthStepper currentStep={1} />
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold text-foreground sm:text-3xl">
            {SIGN_UP_COPY.title}
          </h1>
          <p className="text-sm text-muted-foreground">
            {SIGN_UP_COPY.description}
          </p>
        </div>
      </header>
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
