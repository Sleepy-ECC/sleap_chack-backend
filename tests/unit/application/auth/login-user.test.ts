import { describe, expect, it, vi } from "vitest";

import { AuthUseCaseError } from "../../../../src/application/auth/errors/auth-use-case-error.js";
import type { UserRepository } from "../../../../src/application/auth/repositories/user-repository.js";
import type { PasswordHasher } from "../../../../src/application/auth/services/password-hasher.js";
import type { TokenIssuer } from "../../../../src/application/auth/services/token-issuer.js";
import { LoginUserInteractor } from "../../../../src/application/auth/usecases/login-user.js";
import { Email } from "../../../../src/domain/auth/email.js";
import type { User } from "../../../../src/domain/auth/user.js";

const buildUser = (overrides: Partial<User> = {}): User => ({
  id: "user-1",
  email: Email.create("test@example.com"),
  passwordHash: "hashed-password",
  displayName: "Hitsujii",
  createdAt: new Date("2026-04-22T00:00:00.000Z"),
  ...overrides,
});

describe("LoginUserInteractor", () => {
  it("ユーザーが存在しない場合は INVALID_CREDENTIALS を返す", async () => {
    const userRepository: UserRepository = {
      findByEmail: vi.fn().mockResolvedValue(null),
      create: vi.fn(),
    };
    const passwordHasher: PasswordHasher = {
      hash: vi.fn(),
      compare: vi.fn(),
    };
    const tokenIssuer: TokenIssuer = {
      issueAccessToken: vi.fn(),
    };

    const useCase = new LoginUserInteractor(userRepository, passwordHasher, tokenIssuer);

    const execution = useCase.execute({
      email: "test@example.com",
      password: "password123",
    });

    await expect(execution).rejects.toBeInstanceOf(AuthUseCaseError);
    await expect(execution).rejects.toMatchObject({
      code: "INVALID_CREDENTIALS",
    });

    expect(passwordHasher.compare).not.toHaveBeenCalled();
  });

  it("パスワードが一致しない場合は INVALID_CREDENTIALS を返す", async () => {
    const userRepository: UserRepository = {
      findByEmail: vi.fn().mockResolvedValue(buildUser()),
      create: vi.fn(),
    };
    const passwordHasher: PasswordHasher = {
      hash: vi.fn(),
      compare: vi.fn().mockResolvedValue(false),
    };
    const tokenIssuer: TokenIssuer = {
      issueAccessToken: vi.fn(),
    };

    const useCase = new LoginUserInteractor(userRepository, passwordHasher, tokenIssuer);

    const execution = useCase.execute({
      email: "test@example.com",
      password: "password123",
    });

    await expect(execution).rejects.toBeInstanceOf(AuthUseCaseError);
    await expect(execution).rejects.toMatchObject({
      code: "INVALID_CREDENTIALS",
    });
  });

  it("passwordHash が null の場合は INVALID_CREDENTIALS を返す", async () => {
    const userRepository: UserRepository = {
      findByEmail: vi.fn().mockResolvedValue(
        buildUser({
          passwordHash: null,
        }),
      ),
      create: vi.fn(),
    };
    const passwordHasher: PasswordHasher = {
      hash: vi.fn(),
      compare: vi.fn(),
    };
    const tokenIssuer: TokenIssuer = {
      issueAccessToken: vi.fn(),
    };

    const useCase = new LoginUserInteractor(userRepository, passwordHasher, tokenIssuer);

    const execution = useCase.execute({
      email: "test@example.com",
      password: "password123",
    });

    await expect(execution).rejects.toBeInstanceOf(AuthUseCaseError);
    await expect(execution).rejects.toMatchObject({
      code: "INVALID_CREDENTIALS",
    });

    expect(passwordHasher.compare).not.toHaveBeenCalled();
  });

  it("成功時はユーザーとアクセストークンを返す", async () => {
    const user = buildUser();
    const userRepository: UserRepository = {
      findByEmail: vi.fn().mockResolvedValue(user),
      create: vi.fn(),
    };
    const passwordHasher: PasswordHasher = {
      hash: vi.fn(),
      compare: vi.fn().mockResolvedValue(true),
    };
    const tokenIssuer: TokenIssuer = {
      issueAccessToken: vi.fn().mockReturnValue("access-token"),
    };

    const useCase = new LoginUserInteractor(userRepository, passwordHasher, tokenIssuer);
    const result = await useCase.execute({
      email: "test@example.com",
      password: "password123",
    });

    expect(tokenIssuer.issueAccessToken).toHaveBeenCalledWith({
      sub: "user-1",
      email: "test@example.com",
    });
    expect(result).toEqual({
      user,
      accessToken: "access-token",
    });
  });

  it("repository の想定外エラーはそのまま伝播する", async () => {
    const unexpectedError = new Error("unexpected");
    const userRepository: UserRepository = {
      findByEmail: vi.fn().mockRejectedValue(unexpectedError),
      create: vi.fn(),
    };
    const passwordHasher: PasswordHasher = {
      hash: vi.fn(),
      compare: vi.fn(),
    };
    const tokenIssuer: TokenIssuer = {
      issueAccessToken: vi.fn(),
    };

    const useCase = new LoginUserInteractor(userRepository, passwordHasher, tokenIssuer);

    await expect(
      useCase.execute({
        email: "test@example.com",
        password: "password123",
      }),
    ).rejects.toBe(unexpectedError);
  });
});
