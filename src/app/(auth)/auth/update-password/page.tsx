import type { Metadata } from "next";
import Link from "next/link";

import { UPDATE_PASSWORD_COPY } from "@/config/auth";

import { UpdatePasswordForm } from "./update-password-form";

export const metadata: Metadata = {
  title: UPDATE_PASSWORD_COPY.metaTitle,
  description: UPDATE_PASSWORD_COPY.description,
};

export default function UpdatePasswordPage() {
  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold text-foreground sm:text-3xl">
          {UPDATE_PASSWORD_COPY.title}
        </h1>
        <p className="text-sm text-muted-foreground">
          {UPDATE_PASSWORD_COPY.description}
        </p>
      </header>
      <UpdatePasswordForm />
      <p className="text-sm text-muted-foreground">
        <Link
          href={UPDATE_PASSWORD_COPY.footerLink.href}
          className="font-medium text-primary hover:underline focus-visible:outline-none focus-visible:underline"
        >
          {UPDATE_PASSWORD_COPY.footerLink.label}
        </Link>
      </p>
    </div>
  );
}
