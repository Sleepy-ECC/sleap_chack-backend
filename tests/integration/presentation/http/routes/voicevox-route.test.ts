import { Hono } from "hono";
import { describe, expect, it, vi } from "vitest";

import { VoicevoxUseCaseError } from "../../../../../src/application/voicevox/errors/voicevox-use-case-error.js";
import type { GetVoicevoxSpeakersUseCase } from "../../../../../src/application/voicevox/usecases/get-speakers.js";
import type { SynthesizeVoiceUseCase } from "../../../../../src/application/voicevox/usecases/synthesize-voice.js";
import { createVoicevoxRouter } from "../../../../../src/presentation/http/routes/voicevox.js";

const buildApp = (deps: {
  getVoicevoxSpeakersUseCase: GetVoicevoxSpeakersUseCase;
  synthesizeVoiceUseCase: SynthesizeVoiceUseCase;
}) => {
  const app = new Hono();
  app.route("/voicevox", createVoicevoxRouter(deps));
  return app;
};

describe("voicevox route integration", () => {
  it("speakers をフロント向けレスポンスで返す", async () => {
    const app = buildApp({
      getVoicevoxSpeakersUseCase: {
        execute: vi.fn().mockResolvedValue({
          speakers: [
            {
              name: "もち子さん",
              speaker_uuid: "speaker-1",
              version: "0.0.1",
              styles: [
                {
                  id: 1,
                  name: "ノーマル",
                  type: "talk",
                },
              ],
            },
          ],
        }),
      },
      synthesizeVoiceUseCase: {
        execute: vi.fn(),
      },
    });

    const response = await app.request("/voicevox/speakers");

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      ok: true,
      voices: [
        {
          speaker: 1,
          speakerName: "もち子さん",
          styleName: "ノーマル",
          styleType: "talk",
          speakerUuid: "speaker-1",
          version: "0.0.1",
          label: "もち子さん / ノーマル",
        },
      ],
    });
  });

  it("speakers の use case エラーを 502 に変換する", async () => {
    const app = buildApp({
      getVoicevoxSpeakersUseCase: {
        execute: vi.fn().mockRejectedValue(new VoicevoxUseCaseError("VOICEVOX_REQUEST_FAILED")),
      },
      synthesizeVoiceUseCase: {
        execute: vi.fn(),
      },
    });

    const response = await app.request("/voicevox/speakers");

    expect(response.status).toBe(502);
    await expect(response.json()).resolves.toEqual({
      ok: false,
      error: "VOICEVOX_REQUEST_FAILED",
    });
  });

  it("synthesis の payload が不正な場合は INVALID_REQUEST を返す", async () => {
    const app = buildApp({
      getVoicevoxSpeakersUseCase: {
        execute: vi.fn(),
      },
      synthesizeVoiceUseCase: {
        execute: vi.fn(),
      },
    });

    const response = await app.request("/voicevox/synthesis", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        text: "",
        speaker: -1,
      }),
    });

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      ok: false,
      error: "INVALID_REQUEST",
    });
  });

  it("content-type なしでも synthesis の入力不正を INVALID_REQUEST として返す", async () => {
    const app = buildApp({
      getVoicevoxSpeakersUseCase: {
        execute: vi.fn(),
      },
      synthesizeVoiceUseCase: {
        execute: vi.fn(),
      },
    });

    const response = await app.request("/voicevox/synthesis", {
      method: "POST",
      body: JSON.stringify({
        text: "",
        speaker: -1,
      }),
    });

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      ok: false,
      error: "INVALID_REQUEST",
    });
  });

  it("synthesis で不正な JSON を送ると INVALID_REQUEST を返す", async () => {
    const app = buildApp({
      getVoicevoxSpeakersUseCase: {
        execute: vi.fn(),
      },
      synthesizeVoiceUseCase: {
        execute: vi.fn(),
      },
    });

    const response = await app.request("/voicevox/synthesis", {
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

  it("synthesis で wav を返す", async () => {
    const audio = new TextEncoder().encode("voice").buffer;
    const app = buildApp({
      getVoicevoxSpeakersUseCase: {
        execute: vi.fn(),
      },
      synthesizeVoiceUseCase: {
        execute: vi.fn().mockResolvedValue({
          audio,
          contentType: "audio/wav",
        }),
      },
    });

    const response = await app.request("/voicevox/synthesis", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        text: "こんにちは",
        speaker: 1,
      }),
    });

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe("audio/wav");
    expect(new Uint8Array(await response.arrayBuffer())).toEqual(new Uint8Array(audio));
  });

  it("synthesis の use case エラーを 502 に変換する", async () => {
    const app = buildApp({
      getVoicevoxSpeakersUseCase: {
        execute: vi.fn(),
      },
      synthesizeVoiceUseCase: {
        execute: vi.fn().mockRejectedValue(new VoicevoxUseCaseError("VOICEVOX_REQUEST_FAILED")),
      },
    });

    const response = await app.request("/voicevox/synthesis", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        text: "こんにちは",
        speaker: 1,
      }),
    });

    expect(response.status).toBe(502);
    await expect(response.json()).resolves.toEqual({
      ok: false,
      error: "VOICEVOX_REQUEST_FAILED",
    });
  });
});
