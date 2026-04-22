import { AuthUseCaseError } from "../errors/auth-use-case-error.js";
import type { UserRepository } from "../repositories/user-repository.js";
import type { PasswordHasher } from "../services/password-hasher.js";
import type { TokenIssuer } from "../services/token-issuer.js";
import { Email } from "../../../domain/auth/email.js";
import type { User } from "../../../domain/auth/user.js";

export type LoginUserInput = {
  email: string;
  password: string;
};

export type LoginResult = {
  user: User;
  accessToken: string;
};

export interface LoginUserUseCase {
  execute(input: LoginUserInput): Promise<LoginResult>;
}

export class LoginUserInteractor implements LoginUserUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordHasher: PasswordHasher,
    private readonly tokenIssuer: TokenIssuer,
  ) {}

  async execute(input: LoginUserInput): Promise<LoginResult> {
    const email = Email.create(input.email);
    const user = await this.userRepository.findByEmail(email);

    if (!user?.passwordHash) {
      throw new AuthUseCaseError("INVALID_CREDENTIALS");
    }

    const isValidPassword = await this.passwordHasher.compare(input.password, user.passwordHash);

    if (!isValidPassword) {
      throw new AuthUseCaseError("INVALID_CREDENTIALS");
    }

    return {
      user,
      accessToken: this.tokenIssuer.issueAccessToken({
        sub: user.id,
        email: user.email.value,
      }),
    };
  }
}
