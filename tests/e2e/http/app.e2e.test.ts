import { describe, expect, it, vi } from "vitest";

import { AuthUseCaseError } from "../../../src/application/auth/errors/auth-use-case-error.js";
import type { LoginUserUseCase } from "../../../src/application/auth/usecases/login-user.js";
import type { RegisterUserUseCase } from "../../../src/application/auth/usecases/register-user.js";
import type { CreateSleepRecordUseCase } from "../../../src/application/sleep-records/usecases/create-sleep-record.js";
import type { ListSleepMethodsUseCase } from "../../../src/application/sleep-methods/usecases/list-sleep-methods.js";
import type { GetVoicevoxSpeakersUseCase } from "../../../src/application/voicevox/usecases/get-speakers.js";
import type { SynthesizeVoiceUseCase } from "../../../src/application/voicevox/usecases/synthesize-voice.js";
import { Email } from "../../../src/domain/auth/email.js";

const registerUserUseCase: RegisterUserUseCase = {
  execute: vi.fn(async (input) => ({
    user: {
      id: "user-1",
      email: Email.create(input.email),
      passwordHash: "hashed-password",
      displayName: input.displayName?.trim() ?? null,
      createdAt: new Date("2026-04-22T00:00:00.000Z"),
    },
    accessToken: "access-token",
  })),
};

const loginUserUseCase: LoginUserUseCase = {
  execute: vi.fn(async (input) => {
    if (input.password !== "password123") {
      throw new AuthUseCaseError("INVALID_CREDENTIALS");
    }

    return {
      user: {
        id: "user-1",
        email: Email.create(input.email),
        passwordHash: "hashed-password",
        displayName: "Hitsujii",
        createdAt: new Date("2026-04-22T00:00:00.000Z"),
      },
      accessToken: "access-token",
    };
  }),
};

const getVoicevoxSpeakersUseCase: GetVoicevoxSpeakersUseCase = {
  execute: vi.fn(async () => ({
    speakers: [],
  })),
};

const listSleepMethodsUseCase: ListSleepMethodsUseCase = {
  execute: vi.fn(async () => ({
    sleepMethods: [],
  })),
};

const createSleepRecordUseCase: CreateSleepRecordUseCase = {
  execute: vi.fn(async (input) => ({
    sleepRecord: {
      id: "sleep-record-1",
      userId: input.userId,
      sleepMethodId: input.sleepMethodId,
      sleepDate: input.sleepDate,
      sleptMinutes: input.sleptMinutes,
      createdAt: new Date("2026-04-24T00:00:00.000Z"),
    },
  })),
};

const synthesizeVoiceUseCase: SynthesizeVoiceUseCase = {
  execute: vi.fn(async () => ({
    audio: new Uint8Array([1, 2, 3]).buffer,
    contentType: "audio/wav",
  })),
};

describe("app e2e", () => {
  it("healthz に応答する", async () => {
    const { createApp } = await import("../../../src/app.js");
    const app = createApp({
      authModule: {
        registerUserUseCase,
        loginUserUseCase,
      },
      sleepRecordModule: {
        createSleepRecordUseCase,
      },
      sleepMethodModule: {
        listSleepMethodsUseCase,
      },
      voicevoxModule: {
        getVoicevoxSpeakersUseCase,
        synthesizeVoiceUseCase,
      },
    });

    const response = await app.request("/healthz");

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      ok: true,
      service: "hitsujii-sleep-school-backend",
      env: "test",
    });
  });

  it("組み立て済み app を通して register と login を処理する", async () => {
    const { createApp } = await import("../../../src/app.js");
    const app = createApp({
      authModule: {
        registerUserUseCase,
        loginUserUseCase,
      },
      sleepRecordModule: {
        createSleepRecordUseCase,
      },
      sleepMethodModule: {
        listSleepMethodsUseCase,
      },
      voicevoxModule: {
        getVoicevoxSpeakersUseCase,
        synthesizeVoiceUseCase,
      },
    });

    const registerResponse = await app.request("/auth/register", {
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

    expect(registerResponse.status).toBe(201);

    const loginResponse = await app.request("/auth/login", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        email: "test@example.com",
        password: "password123",
      }),
    });

    expect(loginResponse.status).toBe(200);
    await expect(loginResponse.json()).resolves.toMatchObject({
      ok: true,
      accessToken: "access-token",
      user: {
        email: "test@example.com",
      },
    });
  });

  it("login 失敗時は INVALID_CREDENTIALS を返す", async () => {
    const { createApp } = await import("../../../src/app.js");
    const app = createApp({
      authModule: {
        registerUserUseCase,
        loginUserUseCase,
      },
      sleepRecordModule: {
        createSleepRecordUseCase,
      },
      sleepMethodModule: {
        listSleepMethodsUseCase,
      },
      voicevoxModule: {
        getVoicevoxSpeakersUseCase,
        synthesizeVoiceUseCase,
      },
    });

    const response = await app.request("/auth/login", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        email: "test@example.com",
        password: "wrong-password",
      }),
    });

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({
      ok: false,
      error: "INVALID_CREDENTIALS",
    });
  });

  it("register の入力が不正な場合は INVALID_REQUEST を返す", async () => {
    const { createApp } = await import("../../../src/app.js");
    const app = createApp({
      authModule: {
        registerUserUseCase,
        loginUserUseCase,
      },
      sleepRecordModule: {
        createSleepRecordUseCase,
      },
      sleepMethodModule: {
        listSleepMethodsUseCase,
      },
      voicevoxModule: {
        getVoicevoxSpeakersUseCase,
        synthesizeVoiceUseCase,
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
});
