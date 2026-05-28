import type { Metadata } from "next";
import { Suspense } from "react";

import type { UserProfileDto } from "@/application/account/dtos";
import { Badge } from "@/components/primitives/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/primitives/card";
import { EmptyState } from "@/components/primitives/empty-state";
import { ErrorState } from "@/components/primitives/error-state";
import { PageHeader } from "@/components/primitives/page-header";
import { Skeleton } from "@/components/primitives/skeleton";
import {
  ACCOUNT_DETAILS_COPY,
  ACCOUNT_EMPTY_STATE_COPY,
  ACCOUNT_ERROR_STATE_COPY,
  ACCOUNT_FORM_COPY,
  ACCOUNT_PAGE_COPY,
  ACCOUNT_SIGN_OUT_COPY,
  ROLE_LABEL,
} from "@/config/account";
import { fetchCurrentProfile } from "@/lib/account-cache";
import { requireServerSession } from "@/lib/server-session";

import { AvatarEditor } from "./_components/avatar-editor";
import { ProfileForm } from "./_components/profile-form";
import { SignOutDialog } from "./_components/sign-out-dialog";

export const metadata: Metadata = {
  title: ACCOUNT_PAGE_COPY.metaTitle,
};

export const dynamic = "force-dynamic";

export default function AccountPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow={ACCOUNT_PAGE_COPY.eyebrow}
        title={ACCOUNT_PAGE_COPY.title}
        description={ACCOUNT_PAGE_COPY.description}
      />
      <Suspense fallback={<AccountSkeleton />}>
        <AccountContent />
      </Suspense>
    </div>
  );
}

async function AccountContent() {
  const session = await requireServerSession();
  const result = await fetchCurrentProfile(session.userId);

  if (!result.ok) {
    if (result.error.kind === "not_found") {
      return (
        <EmptyState
          title={ACCOUNT_EMPTY_STATE_COPY.title}
          description={ACCOUNT_EMPTY_STATE_COPY.description}
        />
      );
    }
    return (
      <ErrorState
        title={ACCOUNT_ERROR_STATE_COPY.title}
        description={ACCOUNT_ERROR_STATE_COPY.description}
      />
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <section
        aria-labelledby="account-profile-card"
        className="space-y-6 lg:col-span-2"
      >
        <AvatarEditor profile={result.value} email={session.email} />
        <Card padding="lg">
          <CardHeader>
            <CardTitle id="account-profile-card">
              {ACCOUNT_FORM_COPY.cardTitle}
            </CardTitle>
            <CardDescription>
              {ACCOUNT_FORM_COPY.cardDescription}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ProfileForm profile={result.value} />
          </CardContent>
        </Card>
      </section>

      <aside className="space-y-6">
        <AccountDetailsCard profile={result.value} email={session.email} />
        <SignOutCard />
      </aside>
    </div>
  );
}

interface AccountDetailsCardProps {
  readonly profile: UserProfileDto;
  readonly email: string | null;
}

function AccountDetailsCard({ profile, email }: AccountDetailsCardProps) {
  return (
    <Card padding="lg">
      <CardHeader>
        <CardTitle>{ACCOUNT_DETAILS_COPY.cardTitle}</CardTitle>
        <CardDescription>
          {ACCOUNT_DETAILS_COPY.cardDescription}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <dl className="space-y-4 text-sm">
          <div className="flex flex-col gap-1">
            <dt className="text-xs uppercase tracking-wide text-muted-foreground">
              {ACCOUNT_DETAILS_COPY.emailLabel}
            </dt>
            <dd className="break-words font-medium text-foreground">
              {email ?? ACCOUNT_DETAILS_COPY.emailMissing}
            </dd>
          </div>
          <div className="flex flex-col gap-1">
            <dt className="text-xs uppercase tracking-wide text-muted-foreground">
              {ACCOUNT_DETAILS_COPY.roleLabel}
            </dt>
            <dd>
              <Badge tone={profile.role === "admin" ? "primary" : "neutral"}>
                {ROLE_LABEL[profile.role]}
              </Badge>
            </dd>
          </div>
          <div className="flex flex-col gap-1">
            <dt className="text-xs uppercase tracking-wide text-muted-foreground">
              {ACCOUNT_DETAILS_COPY.userIdLabel}
            </dt>
            <dd className="break-all font-mono text-xs text-muted-foreground">
              {profile.userId}
            </dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  );
}

function SignOutCard() {
  return (
    <Card padding="lg">
      <CardHeader>
        <CardTitle>{ACCOUNT_SIGN_OUT_COPY.cardTitle}</CardTitle>
        <CardDescription>
          {ACCOUNT_SIGN_OUT_COPY.cardDescription}
        </CardDescription>
      </CardHeader>
      <CardFooter className="mt-5 justify-start">
        <SignOutDialog />
      </CardFooter>
    </Card>
  );
}

function AccountSkeleton() {
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <Card padding="lg" className="lg:col-span-2">
        <div className="space-y-3">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-4 w-full max-w-md" />
        </div>
        <div className="mt-6 space-y-5">
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-11 w-full" />
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-11 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-11 w-full" />
            </div>
          </div>
          <div className="flex justify-end">
            <Skeleton className="h-11 w-40" />
          </div>
        </div>
      </Card>
      <div className="space-y-6">
        <Card padding="lg">
          <div className="space-y-3">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-full max-w-xs" />
          </div>
          <div className="mt-5 space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </Card>
        <Card padding="lg">
          <div className="space-y-3">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-full max-w-xs" />
          </div>
          <div className="mt-5 flex justify-start">
            <Skeleton className="h-11 w-40" />
          </div>
        </Card>
      </div>
    </div>
  );
}
