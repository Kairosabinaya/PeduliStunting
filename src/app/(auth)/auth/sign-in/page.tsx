import type { Metadata } from "next";
import Link from "next/link";

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
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold text-foreground sm:text-3xl">
          {SIGN_IN_COPY.title}
        </h1>
        <p className="text-sm text-muted-foreground">
          {SIGN_IN_COPY.description}
        </p>
      </header>
      <SignInForm redirectTo={redirect} errorCode={error} />
      <p className="text-sm text-muted-foreground">
        {SIGN_IN_COPY.footerPrompt}{" "}
        <Link
          href={SIGN_IN_COPY.footerLink.href}
          className="font-medium text-primary hover:underline focus-visible:outline-none focus-visible:underline"
        >
          {SIGN_IN_COPY.footerLink.label}
        </Link>
        .
      </p>
    </div>
  );
}
