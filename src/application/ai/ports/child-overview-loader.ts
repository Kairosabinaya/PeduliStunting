/**
 * Injected loader for a child's overview bundle. Decouples the tracker AI tool
 * and the tracker page-context builder from the concrete, server-only
 * `loadChildOverview` so both stay unit-testable with a fake. The real loader is
 * wired in the composition root.
 *
 * Ownership/RLS is enforced inside the concrete loader (it reads via the
 * request-scoped Supabase client keyed by `userId`), so a forged `childId`
 * cannot read another owner's data.
 */

import type { AppError } from "@/domain/errors/app-error";
import type { Result } from "@/domain/shared/result";
import type { ChildId, UserId } from "@/domain/shared/ids";
// Type-only import: erased at runtime, so the server-only module is not pulled in.
import type { ChildOverviewData } from "@/lib/child-overview";

export type { ChildOverviewData };

export type ChildOverviewLoader = (
  userId: UserId,
  childId: ChildId,
) => Promise<Result<ChildOverviewData, AppError>>;
