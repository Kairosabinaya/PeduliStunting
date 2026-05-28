import type { Metadata } from "next";

import type { AdminAccountDto } from "@/application/account/dtos";
import { ErrorState } from "@/components/primitives/error-state";
import { PageHeader } from "@/components/primitives/page-header";
import { makeAdminUseCases } from "@/composition";
import { ADMIN_USERS_COPY, ADMIN_USERS_TABLE_COPY } from "@/config/admin";
import { createSupabaseAdminClient } from "@/infrastructure/supabase/server-client";
import { requireServerSession } from "@/lib/server-session";

import { AdminUsersTable } from "./users-table";

export const metadata: Metadata = {
  title: ADMIN_USERS_COPY.metaTitle,
};

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const session = await requireServerSession();

  let accounts: readonly AdminAccountDto[] = [];
  let errored = false;

  try {
    const admin = createSupabaseAdminClient();
    const { listAdminAccounts } = makeAdminUseCases(admin);
    const result = await listAdminAccounts.execute();
    if (result.ok) {
      accounts = result.value;
    } else {
      errored = true;
    }
  } catch {
    errored = true;
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow={ADMIN_USERS_COPY.eyebrow}
        title={ADMIN_USERS_COPY.title}
        description={ADMIN_USERS_COPY.description}
      />
      {errored ? (
        <ErrorState
          title={ADMIN_USERS_TABLE_COPY.errorTitle}
          description={ADMIN_USERS_TABLE_COPY.errorDescription}
        />
      ) : (
        <AdminUsersTable accounts={accounts} currentUserId={session.userId} />
      )}
    </div>
  );
}
