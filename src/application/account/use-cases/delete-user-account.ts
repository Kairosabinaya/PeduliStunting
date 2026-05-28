import { AppErrors, type AppError } from "@/domain/errors/app-error";
import { err, type Result } from "@/domain/shared/result";
import type { UserId } from "@/domain/shared/ids";
import type { AdminAccountRepository } from "@/domain/account/ports/admin-account-repository";

export interface DeleteUserAccountCommand {
  /** Admin issuing the request (used to forbid self-deletion). */
  readonly actorUserId: UserId;
  /** Target account to delete. */
  readonly targetUserId: UserId;
}

/**
 * Hard-deletes an account. Refuses to delete the actor's own account
 * because losing access mid-session breaks the dashboard and is rarely
 * what the admin actually wants.
 */
export class DeleteUserAccountUseCase {
  constructor(private readonly repository: AdminAccountRepository) {}

  async execute(
    command: DeleteUserAccountCommand,
  ): Promise<Result<void, AppError>> {
    if (command.actorUserId === command.targetUserId) {
      return err(
        AppErrors.forbidden(
          "Tidak bisa menghapus akun Anda sendiri lewat panel admin.",
        ),
      );
    }
    return this.repository.deleteAccount(command.targetUserId);
  }
}
