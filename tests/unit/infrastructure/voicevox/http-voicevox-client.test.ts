import { afterEach, describe, expect, it, vi } from "vitest";

import { VoicevoxRequestError } from "../../../../src/application/voicevox/services/voicevox-client.js";
import { env } from "../../../../src/config/env.js";
import { HttpVoicevoxClient } from "../../../../src/infrastructure/voicevox/http-voicevox-client.js";

describe("HttpVoicevoxClient", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("speakers を取得する", async () => {
    const speakers = [
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
    ];

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify(speakers), {
          status: 200,
          headers: {
            "content-type": "application/json",
          },
        }),
      ),
    );

    const client = new HttpVoicevoxClient();

    await expect(client.fetchSpeakers()).resolves.toEqual(speakers);
    expect(fetch).toHaveBeenCalledWith(`${env.VOICEVOX_API_BASE_URL}/speakers`);
  });

  it("speakers 取得に失敗した場合は VoicevoxRequestError を投げる", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(null, {
          status: 500,
        }),
      ),
    );

    const client = new HttpVoicevoxClient();

    await expect(client.fetchSpeakers()).rejects.toBeInstanceOf(VoicevoxRequestError);
  });

  it("audio_query と synthesis を順に呼び出して音声を返す", async () => {
    const audioQuery = { accentPhrases: [] };
    const audio = new Uint8Array([1, 2, 3]).buffer;
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(JSON.stringify(audioQuery), {
          status: 200,
          headers: {
            "content-type": "application/json",
          },
        }),
      )
      .mockResolvedValueOnce(
        new Response(audio, {
          status: 200,
          headers: {
            "content-type": "audio/wav",
          },
        }),
      );

    vi.stubGlobal("fetch", fetchMock);

    const client = new HttpVoicevoxClient();

    await expect(
      client.synthesize({
        text: "こんにちは",
        speaker: 1,
      }),
    ).resolves.toEqual({
      audio,
      contentType: "audio/wav",
    });

    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      `${env.VOICEVOX_API_BASE_URL}/audio_query?text=%E3%81%93%E3%82%93%E3%81%AB%E3%81%A1%E3%81%AF&speaker=1`,
      {
        method: "POST",
      },
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      `${env.VOICEVOX_API_BASE_URL}/synthesis?speaker=1`,
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify(audioQuery),
      },
    );
  });

  it("synthesis の content-type が無い場合は audio/wav を使う", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ accentPhrases: [] }), {
          status: 200,
          headers: {
            "content-type": "application/json",
          },
        }),
      )
      .mockResolvedValueOnce(
        new Response(new Uint8Array([1, 2, 3]).buffer, {
          status: 200,
        }),
      );

    vi.stubGlobal("fetch", fetchMock);

    const client = new HttpVoicevoxClient();

    await expect(
      client.synthesize({
        text: "こんにちは",
        speaker: 1,
      }),
    ).resolves.toMatchObject({
      contentType: "audio/wav",
    });
  });

  it("audio_query が失敗した場合は VoicevoxRequestError を投げる", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(null, {
          status: 500,
        }),
      ),
    );

    const client = new HttpVoicevoxClient();

    await expect(
      client.synthesize({
        text: "こんにちは",
        speaker: 1,
      }),
    ).rejects.toBeInstanceOf(VoicevoxRequestError);
  });

  it("synthesis が失敗した場合は VoicevoxRequestError を投げる", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ accentPhrases: [] }), {
          status: 200,
          headers: {
            "content-type": "application/json",
          },
        }),
      )
      .mockResolvedValueOnce(
        new Response(null, {
          status: 500,
        }),
      );

    vi.stubGlobal("fetch", fetchMock);

    const client = new HttpVoicevoxClient();

    await expect(
      client.synthesize({
        text: "こんにちは",
        speaker: 1,
      }),
    ).rejects.toBeInstanceOf(VoicevoxRequestError);
  });
});
