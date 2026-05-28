import { map, type Result } from "@/domain/shared/result";
import type { AppError } from "@/domain/errors/app-error";
import type { AdminAccountRepository } from "@/domain/account/ports/admin-account-repository";

import { toAdminAccountDto, type AdminAccountDto } from "../dtos";

/**
 * Returns every account in the system for the admin dashboard. Caller
 * is responsible for ensuring the requesting user holds the admin
 * role — this use case does not double-check.
 */
export class ListAdminAccountsUseCase {
  constructor(private readonly repository: AdminAccountRepository) {}

  async execute(): Promise<Result<readonly AdminAccountDto[], AppError>> {
    const result = await this.repository.listAll();
    return map(result, (accounts) => accounts.map(toAdminAccountDto));
  }
}
