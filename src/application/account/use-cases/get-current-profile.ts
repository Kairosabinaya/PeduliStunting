import { AppErrors, type AppError } from "@/domain/errors/app-error";
import { err, ok, type Result } from "@/domain/shared/result";
import type { UserId } from "@/domain/shared/ids";
import type { UserProfileRepository } from "@/domain/account/ports/user-profile-repository";
import { toUserProfileDto, type UserProfileDto } from "../dtos";

export class GetCurrentProfileUseCase {
  constructor(private readonly repository: UserProfileRepository) {}

  async execute(userId: UserId): Promise<Result<UserProfileDto, AppError>> {
    const result = await this.repository.findByUserId(userId);
    if (!result.ok) return err(result.error);
    if (result.value === null) {
      return err(
        AppErrors.notFound("Profil pengguna tidak ditemukan.", "profiles"),
      );
    }
    return ok(toUserProfileDto(result.value));
  }
}
