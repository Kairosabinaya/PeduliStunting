"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";

import type { AdminAccountDto } from "@/application/account/dtos";
import { Avatar } from "@/components/primitives/avatar";
import { Badge } from "@/components/primitives/badge";
import { Button } from "@/components/primitives/button";
import { EmptyState } from "@/components/primitives/empty-state";
import { FeedbackBanner } from "@/components/primitives/feedback-banner";
import { Modal } from "@/components/primitives/modal";
import {
  ADMIN_DELETE_DIALOG_COPY,
  ADMIN_USERS_TABLE_COPY,
} from "@/config/admin";

import { deleteUserAccountAction } from "./actions";
import {
  INITIAL_DELETE_USER_STATE,
  type DeleteUserAccountFormState,
} from "./_lib/delete-state";

interface AdminUsersTableProps {
  readonly accounts: readonly AdminAccountDto[];
  readonly currentUserId: string;
}

function formatDate(iso: string | null): string {
  if (!iso) return ADMIN_USERS_TABLE_COPY.neverSignedIn;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function DeleteSubmit() {
  const status = useFormStatus();
  return (
    <Button
      type="submit"
      variant="danger"
      size="sm"
      loading={status.pending}
      fullWidth
    >
      {status.pending
        ? ADMIN_DELETE_DIALOG_COPY.pending
        : ADMIN_DELETE_DIALOG_COPY.confirm}
    </Button>
  );
}

export function AdminUsersTable({
  accounts,
  currentUserId,
}: AdminUsersTableProps) {
  const [target, setTarget] = useState<AdminAccountDto | null>(null);
  const [state, action] = useActionState<
    DeleteUserAccountFormState | null,
    FormData
  >(deleteUserAccountAction, INITIAL_DELETE_USER_STATE);

  // Close the dialog as soon as the action lands successfully so the
  // user gets immediate confirmation that the row is gone.
  const [seenState, setSeenState] = useState<DeleteUserAccountFormState | null>(
    state,
  );
  if (state !== seenState) {
    setSeenState(state);
    if (state?.ok && target) setTarget(null);
  }

  const error = state && !state.ok ? state.message : null;

  if (accounts.length === 0) {
    return (
      <EmptyState
        title={ADMIN_USERS_TABLE_COPY.emptyTitle}
        description={ADMIN_USERS_TABLE_COPY.emptyDescription}
      />
    );
  }

  return (
    <div className="space-y-4">
      {error ? <FeedbackBanner tone="error">{error}</FeedbackBanner> : null}

      <div className="overflow-x-auto rounded-2xl border border-border bg-surface shadow-xs">
        <table className="min-w-full divide-y divide-border text-sm">
          <thead className="bg-muted/60 text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th scope="col" className="px-4 py-3 text-left font-semibold">
                {ADMIN_USERS_TABLE_COPY.columns.user}
              </th>
              <th scope="col" className="px-4 py-3 text-left font-semibold">
                {ADMIN_USERS_TABLE_COPY.columns.email}
              </th>
              <th scope="col" className="px-4 py-3 text-left font-semibold">
                {ADMIN_USERS_TABLE_COPY.columns.role}
              </th>
              <th scope="col" className="px-4 py-3 text-left font-semibold">
                {ADMIN_USERS_TABLE_COPY.columns.status}
              </th>
              <th scope="col" className="px-4 py-3 text-left font-semibold">
                {ADMIN_USERS_TABLE_COPY.columns.createdAt}
              </th>
              <th scope="col" className="px-4 py-3 text-left font-semibold">
                {ADMIN_USERS_TABLE_COPY.columns.lastSignIn}
              </th>
              <th scope="col" className="px-4 py-3 text-right font-semibold">
                {ADMIN_USERS_TABLE_COPY.columns.actions}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {accounts.map((account) => {
              const isSelf = account.userId === currentUserId;
              const verified = Boolean(account.emailConfirmedAt);
              return (
                <tr key={account.userId}>
                  <td className="px-4 py-3 align-middle">
                    <div className="flex items-center gap-3">
                      <Avatar
                        size="md"
                        src={account.avatarUrl}
                        displayName={account.displayName}
                        email={account.email}
                      />
                      <div className="min-w-0">
                        <p className="truncate font-medium text-foreground">
                          {account.displayName ?? "—"}
                        </p>
                        <p className="truncate font-mono text-[11px] text-muted-foreground">
                          {account.userId}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 align-middle">
                    <span className="break-all text-foreground">
                      {account.email ?? "—"}
                    </span>
                  </td>
                  <td className="px-4 py-3 align-middle">
                    <Badge
                      tone={account.role === "admin" ? "primary" : "neutral"}
                    >
                      {account.role === "admin"
                        ? ADMIN_USERS_TABLE_COPY.roleAdmin
                        : ADMIN_USERS_TABLE_COPY.roleUser}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 align-middle">
                    <Badge tone={verified ? "success" : "warning"}>
                      {verified
                        ? ADMIN_USERS_TABLE_COPY.statusVerified
                        : ADMIN_USERS_TABLE_COPY.statusPending}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 align-middle text-muted-foreground">
                    {formatDate(account.createdAt)}
                  </td>
                  <td className="px-4 py-3 align-middle text-muted-foreground">
                    {formatDate(account.lastSignInAt)}
                  </td>
                  <td className="px-4 py-3 text-right align-middle">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      disabled={isSelf}
                      onClick={() => setTarget(account)}
                      className={
                        isSelf ? "text-muted-foreground" : "text-danger"
                      }
                    >
                      {isSelf
                        ? ADMIN_USERS_TABLE_COPY.deleteSelf
                        : ADMIN_USERS_TABLE_COPY.deleteAction}
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Modal
        open={target !== null}
        onClose={() => setTarget(null)}
        title={ADMIN_DELETE_DIALOG_COPY.title}
        description={ADMIN_DELETE_DIALOG_COPY.description}
        variant="centered"
        footer={
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-end">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setTarget(null)}
            >
              {ADMIN_DELETE_DIALOG_COPY.cancel}
            </Button>
            <form action={action}>
              <input
                type="hidden"
                name="targetUserId"
                value={target?.userId ?? ""}
              />
              <DeleteSubmit />
            </form>
          </div>
        }
      >
        {target ? (
          <div className="space-y-3">
            <div className="flex items-center gap-3 rounded-xl bg-muted/40 p-3">
              <Avatar
                size="lg"
                src={target.avatarUrl}
                displayName={target.displayName}
                email={target.email}
              />
              <div className="min-w-0">
                <p className="truncate font-medium text-foreground">
                  {target.displayName ?? "—"}
                </p>
                <p className="truncate text-sm text-muted-foreground">
                  {target.email ?? target.userId}
                </p>
              </div>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
