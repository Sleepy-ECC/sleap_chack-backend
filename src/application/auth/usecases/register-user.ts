import { AuthUseCaseError } from "../errors/auth-use-case-error.js";
import { DuplicateUserEmailError, type UserRepository } from "../repositories/user-repository.js";
import type { PasswordHasher } from "../services/password-hasher.js";
import type { TokenIssuer } from "../services/token-issuer.js";
import { Email } from "../../../domain/auth/email.js";
import type { User } from "../../../domain/auth/user.js";

export type RegisterUserInput = {
  email: string;
  password: string;
  displayName?: string;
};

export type AuthResult = {
  user: User;
  accessToken: string;
};

export interface RegisterUserUseCase {
  execute(input: RegisterUserInput): Promise<AuthResult>;
}

export class RegisterUserInteractor implements RegisterUserUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordHasher: PasswordHasher,
    private readonly tokenIssuer: TokenIssuer,
  ) {}

  async execute(input: RegisterUserInput): Promise<AuthResult> {
    const email = Email.create(input.email);
    const existingUser = await this.userRepository.findByEmail(email);

    if (existingUser) {
      throw new AuthUseCaseError("EMAIL_ALREADY_EXISTS");
    }

    const passwordHash = await this.passwordHasher.hash(input.password);
    let createdUser;

    try {
      createdUser = await this.userRepository.create({
        email,
        passwordHash,
        displayName: input.displayName?.trim() ?? null,
      });
    } catch (error) {
      if (error instanceof DuplicateUserEmailError) {
        throw new AuthUseCaseError("EMAIL_ALREADY_EXISTS");
      }

      throw error;
    }

    return {
      user: createdUser,
      accessToken: this.tokenIssuer.issueAccessToken({
        sub: createdUser.id,
        email: createdUser.email.value,
      }),
    };
  }
}
