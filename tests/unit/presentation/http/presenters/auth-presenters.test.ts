import { describe, expect, it } from "vitest";
import { z } from "zod";

import { AuthUseCaseError } from "../../../../../src/application/auth/errors/auth-use-case-error.js";
import { Email } from "../../../../../src/domain/auth/email.js";
import { toAuthErrorResponse } from "../../../../../src/presentation/http/presenters/auth-error-presenter.js";
import { toAuthSuccessResponse } from "../../../../../src/presentation/http/presenters/auth-success-presenter.js";
import { toValidationErrorResponse } from "../../../../../src/presentation/http/presenters/validation-error-presenter.js";

describe("auth presenters", () => {
  it("EMAIL_ALREADY_EXISTS を 409 に変換する", () => {
    expect(toAuthErrorResponse(new AuthUseCaseError("EMAIL_ALREADY_EXISTS"))).toEqual({
      status: 409,
      body: {
        ok: false,
        error: "EMAIL_ALREADY_EXISTS",
      },
    });
  });

  it("INVALID_CREDENTIALS を 401 に変換する", () => {
    expect(toAuthErrorResponse(new AuthUseCaseError("INVALID_CREDENTIALS"))).toEqual({
      status: 401,
      body: {
        ok: false,
        error: "INVALID_CREDENTIALS",
      },
    });
  });

  it("認証成功レスポンスを JSON へ変換する", () => {
    expect(
      toAuthSuccessResponse({
        user: {
          id: "user-1",
          email: Email.create("test@example.com"),
          passwordHash: "hashed-password",
          displayName: "Hitsujii",
          createdAt: new Date("2026-04-22T00:00:00.000Z"),
        },
        accessToken: "access-token",
      }),
    ).toEqual({
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

  it("バリデーションエラーを INVALID_REQUEST に変換する", () => {
    const schema = z.object({
      email: z.email(),
    });
    const result = schema.safeParse({
      email: "not-an-email",
    });

    if (result.success) {
      throw new Error("バリデーションエラーになる想定です");
    }

    expect(toValidationErrorResponse(result.error)).toEqual({
      status: 400,
      body: {
        ok: false,
        error: "INVALID_REQUEST",
        issues: {
          email: expect.any(Array),
        },
      },
    });
  });
});
