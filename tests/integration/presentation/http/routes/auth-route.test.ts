import { Hono } from "hono";
import { describe, expect, it, vi } from "vitest";

import { AuthUseCaseError } from "../../../../../src/application/auth/errors/auth-use-case-error.js";
import type { LoginUserUseCase } from "../../../../../src/application/auth/usecases/login-user.js";
import type { RegisterUserUseCase } from "../../../../../src/application/auth/usecases/register-user.js";
import { Email } from "../../../../../src/domain/auth/email.js";
import { createAuthRouter } from "../../../../../src/presentation/http/routes/auth.js";

const buildApp = (deps: {
  registerUserUseCase: RegisterUserUseCase;
  loginUserUseCase: LoginUserUseCase;
}) => {
  const app = new Hono();
  app.route("/auth", createAuthRouter(deps));
  return app;
};

describe("auth route integration", () => {
  it("register の payload が不正な場合は INVALID_REQUEST を返す", async () => {
    const app = buildApp({
      registerUserUseCase: {
        execute: vi.fn(),
      },
      loginUserUseCase: {
        execute: vi.fn(),
      },
    });

    const response = await app.request("/auth/register", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        email: "bad-email",
        password: "short",
      }),
    });

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      ok: false,
      error: "INVALID_REQUEST",
    });
  });

  it("register で成功レスポンスを返す", async () => {
    const registerUserUseCase: RegisterUserUseCase = {
      execute: vi.fn().mockResolvedValue({
        user: {
          id: "user-1",
          email: Email.create("test@example.com"),
          passwordHash: "hashed-password",
          displayName: "Hitsujii",
          createdAt: new Date("2026-04-22T00:00:00.000Z"),
        },
        accessToken: "access-token",
      }),
    };
    const app = buildApp({
      registerUserUseCase,
      loginUserUseCase: {
        execute: vi.fn(),
      },
    });

    const response = await app.request("/auth/register", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        email: "test@example.com",
        password: "password123",
        displayName: "Hitsujii",
      }),
    });

    expect(response.status).toBe(201);
    await expect(response.json()).resolves.toEqual({
      ok: true,
      user: {
        id: "user-1",
        email: "test@example.com",
        displayName: "Hitsujii",
        createdAt: "2026-04-22T00:00:00.000Z",
      },
      accessToken: "access-token",
    });
  });

  it("register で EMAIL_ALREADY_EXISTS を 409 に変換する", async () => {
    const app = buildApp({
      registerUserUseCase: {
        execute: vi.fn().mockRejectedValue(new AuthUseCaseError("EMAIL_ALREADY_EXISTS")),
      },
      loginUserUseCase: {
        execute: vi.fn(),
      },
    });

    const response = await app.request("/auth/register", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        email: "test@example.com",
        password: "password123",
      }),
    });

    expect(response.status).toBe(409);
    await expect(response.json()).resolves.toEqual({
      ok: false,
      error: "EMAIL_ALREADY_EXISTS",
    });
  });

  it("content-type なしでも register の入力不正を INVALID_REQUEST として返す", async () => {
    const app = buildApp({
      registerUserUseCase: {
        execute: vi.fn(),
      },
      loginUserUseCase: {
        execute: vi.fn(),
      },
    });

    const response = await app.request("/auth/register", {
      method: "POST",
      body: JSON.stringify({
        email: "bad-email",
        password: "short",
      }),
    });

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      ok: false,
      error: "INVALID_REQUEST",
    });
  });

  it("displayName が空文字や空白だけの場合は INVALID_REQUEST を返す", async () => {
    const app = buildApp({
      registerUserUseCase: {
        execute: vi.fn(),
      },
      loginUserUseCase: {
        execute: vi.fn(),
      },
    });

    const emptyResponse = await app.request("/auth/register", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        email: "test@example.com",
        password: "password123",
        displayName: "",
      }),
    });

    expect(emptyResponse.status).toBe(400);
    await expect(emptyResponse.json()).resolves.toMatchObject({
      ok: false,
      error: "INVALID_REQUEST",
    });

    const blankResponse = await app.request("/auth/register", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        email: "test@example.com",
        password: "password123",
        displayName: "   ",
      }),
    });

    expect(blankResponse.status).toBe(400);
    await expect(blankResponse.json()).resolves.toMatchObject({
      ok: false,
      error: "INVALID_REQUEST",
    });
  });

  it("login の use case エラーを HTTP レスポンスへ変換する", async () => {
    const app = buildApp({
      registerUserUseCase: {
        execute: vi.fn(),
      },
      loginUserUseCase: {
        execute: vi.fn().mockRejectedValue(new AuthUseCaseError("INVALID_CREDENTIALS")),
      },
    });

    const response = await app.request("/auth/login", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        email: "test@example.com",
        password: "password123",
      }),
    });

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({
      ok: false,
      error: "INVALID_CREDENTIALS",
    });
  });

  it("login の payload が不正な場合は INVALID_REQUEST を返す", async () => {
    const app = buildApp({
      registerUserUseCase: {
        execute: vi.fn(),
      },
      loginUserUseCase: {
        execute: vi.fn(),
      },
    });

    const response = await app.request("/auth/login", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        email: "bad-email",
        password: "short",
      }),
    });

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      ok: false,
      error: "INVALID_REQUEST",
    });
  });

  it("不正な JSON の場合は INVALID_REQUEST を返す", async () => {
    const app = buildApp({
      registerUserUseCase: {
        execute: vi.fn(),
      },
      loginUserUseCase: {
        execute: vi.fn(),
      },
    });

    const response = await app.request("/auth/register", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: "{invalid-json",
    });

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      ok: false,
      error: "INVALID_REQUEST",
    });
  });
});
