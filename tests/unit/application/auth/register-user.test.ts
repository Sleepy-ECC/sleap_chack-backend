import { describe, expect, it, vi } from "vitest";

import { AuthUseCaseError } from "../../../../src/application/auth/errors/auth-use-case-error.js";
import { DuplicateUserEmailError, type CreateUserInput, type UserRepository } from "../../../../src/application/auth/repositories/user-repository.js";
import type { PasswordHasher } from "../../../../src/application/auth/services/password-hasher.js";
import type { TokenIssuer } from "../../../../src/application/auth/services/token-issuer.js";
import { RegisterUserInteractor } from "../../../../src/application/auth/usecases/register-user.js";
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

describe("RegisterUserInteractor", () => {
  it("ユーザーを登録してアクセストークンを返す", async () => {
    let createdInput: CreateUserInput | undefined;

    const userRepository: UserRepository = {
      findByEmail: vi.fn().mockResolvedValue(null),
      create: vi.fn().mockImplementation(async (input: CreateUserInput) => {
        createdInput = input;
        return buildUser({
          email: input.email,
          displayName: input.displayName,
          passwordHash: input.passwordHash,
        });
      }),
    };
    const passwordHasher: PasswordHasher = {
      hash: vi.fn().mockResolvedValue("hashed-password"),
      compare: vi.fn(),
    };
    const tokenIssuer: TokenIssuer = {
      issueAccessToken: vi.fn().mockReturnValue("access-token"),
    };

    const useCase = new RegisterUserInteractor(userRepository, passwordHasher, tokenIssuer);

    const result = await useCase.execute({
      email: "  TEST@example.com ",
      password: "password123",
      displayName: "  Hitsujii  ",
    });

    expect(createdInput).toEqual({
      email: Email.create("test@example.com"),
      passwordHash: "hashed-password",
      displayName: "Hitsujii",
    });
    expect(tokenIssuer.issueAccessToken).toHaveBeenCalledWith({
      sub: "user-1",
      email: "test@example.com",
    });
    expect(result).toEqual({
      user: buildUser({
        email: Email.create("test@example.com"),
        displayName: "Hitsujii",
      }),
      accessToken: "access-token",
    });
  });

  it("作成前にメールアドレスが既に存在する場合はエラーを返す", async () => {
    const userRepository: UserRepository = {
      findByEmail: vi.fn().mockResolvedValue(buildUser()),
      create: vi.fn(),
    };
    const passwordHasher: PasswordHasher = {
      hash: vi.fn(),
      compare: vi.fn(),
    };
    const tokenIssuer: TokenIssuer = {
      issueAccessToken: vi.fn(),
    };

    const useCase = new RegisterUserInteractor(userRepository, passwordHasher, tokenIssuer);

    const execution = useCase.execute({
      email: "test@example.com",
      password: "password123",
    });

    await expect(execution).rejects.toBeInstanceOf(AuthUseCaseError);
    await expect(execution).rejects.toMatchObject({
      code: "EMAIL_ALREADY_EXISTS",
    });

    expect(passwordHasher.hash).not.toHaveBeenCalled();
    expect(userRepository.create).not.toHaveBeenCalled();
  });

  it("repository の重複エラーを application エラーへ変換する", async () => {
    const userRepository: UserRepository = {
      findByEmail: vi.fn().mockResolvedValue(null),
      create: vi.fn().mockRejectedValue(new DuplicateUserEmailError()),
    };
    const passwordHasher: PasswordHasher = {
      hash: vi.fn().mockResolvedValue("hashed-password"),
      compare: vi.fn(),
    };
    const tokenIssuer: TokenIssuer = {
      issueAccessToken: vi.fn(),
    };

    const useCase = new RegisterUserInteractor(userRepository, passwordHasher, tokenIssuer);

    const execution = useCase.execute({
      email: "test@example.com",
      password: "password123",
    });

    await expect(execution).rejects.toBeInstanceOf(AuthUseCaseError);
    await expect(execution).rejects.toMatchObject({
      code: "EMAIL_ALREADY_EXISTS",
    });
  });

  it("displayName が未指定の場合は null で保存する", async () => {
    let createdInput: CreateUserInput | undefined;

    const userRepository: UserRepository = {
      findByEmail: vi.fn().mockResolvedValue(null),
      create: vi.fn().mockImplementation(async (input: CreateUserInput) => {
        createdInput = input;
        return buildUser({
          email: input.email,
          displayName: input.displayName,
          passwordHash: input.passwordHash,
        });
      }),
    };
    const passwordHasher: PasswordHasher = {
      hash: vi.fn().mockResolvedValue("hashed-password"),
      compare: vi.fn(),
    };
    const tokenIssuer: TokenIssuer = {
      issueAccessToken: vi.fn().mockReturnValue("access-token"),
    };

    const useCase = new RegisterUserInteractor(userRepository, passwordHasher, tokenIssuer);

    await useCase.execute({
      email: "test@example.com",
      password: "password123",
    });

    expect(createdInput).toEqual({
      email: Email.create("test@example.com"),
      passwordHash: "hashed-password",
      displayName: null,
    });
  });

  it("repository の想定外エラーはそのまま伝播する", async () => {
    const unexpectedError = new Error("unexpected");
    const userRepository: UserRepository = {
      findByEmail: vi.fn().mockResolvedValue(null),
      create: vi.fn().mockRejectedValue(unexpectedError),
    };
    const passwordHasher: PasswordHasher = {
      hash: vi.fn().mockResolvedValue("hashed-password"),
      compare: vi.fn(),
    };
    const tokenIssuer: TokenIssuer = {
      issueAccessToken: vi.fn(),
    };

    const useCase = new RegisterUserInteractor(userRepository, passwordHasher, tokenIssuer);

    await expect(
      useCase.execute({
        email: "test@example.com",
        password: "password123",
      }),
    ).rejects.toBe(unexpectedError);
  });
});
