import { map, type Result } from "@/domain/shared/result";
import type { AppError } from "@/domain/errors/app-error";
import type { UserId } from "@/domain/shared/ids";
import type { ThemePreference } from "@/domain/account/entities/user-profile";
import type { UserProfileRepository } from "@/domain/account/ports/user-profile-repository";
import { toUserProfileDto, type UserProfileDto } from "../dtos";

export interface UpdateUserProfileCommand {
  readonly userId: UserId;
  readonly displayName: string | null;
  readonly themePreference: ThemePreference;
  readonly locale: string;
}

export class UpdateUserProfileUseCase {
  constructor(private readonly repository: UserProfileRepository) {}

  async execute(
    command: UpdateUserProfileCommand,
  ): Promise<Result<UserProfileDto, AppError>> {
    const result = await this.repository.updatePreferences({
      userId: command.userId,
      displayName: command.displayName,
      themePreference: command.themePreference,
      locale: command.locale,
    });
    return map(result, toUserProfileDto);
  }
}
