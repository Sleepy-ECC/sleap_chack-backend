import { describe, expect, it } from "vitest";

import { VoicevoxUseCaseError } from "../../../../../src/application/voicevox/errors/voicevox-use-case-error.js";
import { toVoicevoxErrorResponse } from "../../../../../src/presentation/http/presenters/voicevox-error-presenter.js";
import { toVoicevoxSpeakersResponse } from "../../../../../src/presentation/http/presenters/voicevox-speakers-presenter.js";

describe("voicevox presenters", () => {
  it("話者一覧をフロント向けの voices 配列へ変換する", () => {
    expect(
      toVoicevoxSpeakersResponse({
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
    ).toEqual({
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

  it("複数スタイルを voices 配列へフラットに変換する", () => {
    expect(
      toVoicevoxSpeakersResponse({
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
              {
                id: 2,
                name: "ささやき",
                type: "talk",
              },
            ],
          },
        ],
      }),
    ).toEqual({
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
        {
          speaker: 2,
          speakerName: "もち子さん",
          styleName: "ささやき",
          styleType: "talk",
          speakerUuid: "speaker-1",
          version: "0.0.1",
          label: "もち子さん / ささやき",
        },
      ],
    });
  });

  it("use case エラーを 502 レスポンスへ変換する", () => {
    expect(
      toVoicevoxErrorResponse(new VoicevoxUseCaseError("VOICEVOX_REQUEST_FAILED")),
    ).toEqual({
      status: 502,
      body: {
        ok: false,
        error: "VOICEVOX_REQUEST_FAILED",
      },
    });
  });
});
