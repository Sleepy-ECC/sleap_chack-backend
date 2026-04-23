import { describe, expect, it, vi } from "vitest";

import { VoicevoxUseCaseError } from "../../../../src/application/voicevox/errors/voicevox-use-case-error.js";
import { VoicevoxRequestError, type VoicevoxClient, type VoicevoxSpeaker } from "../../../../src/application/voicevox/services/voicevox-client.js";
import { GetVoicevoxSpeakersInteractor } from "../../../../src/application/voicevox/usecases/get-speakers.js";

const buildSpeaker = (): VoicevoxSpeaker => ({
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
});

describe("GetVoicevoxSpeakersInteractor", () => {
  it("話者一覧を返す", async () => {
    const speakers = [buildSpeaker()];
    const voicevoxClient: VoicevoxClient = {
      fetchSpeakers: vi.fn().mockResolvedValue(speakers),
      synthesize: vi.fn(),
    };

    const useCase = new GetVoicevoxSpeakersInteractor(voicevoxClient);

    await expect(useCase.execute()).resolves.toEqual({
      speakers,
    });
  });

  it("VOICEVOX のリクエストエラーを application エラーへ変換する", async () => {
    const voicevoxClient: VoicevoxClient = {
      fetchSpeakers: vi.fn().mockRejectedValue(new VoicevoxRequestError()),
      synthesize: vi.fn(),
    };

    const useCase = new GetVoicevoxSpeakersInteractor(voicevoxClient);
    const execution = useCase.execute();

    await expect(execution).rejects.toBeInstanceOf(VoicevoxUseCaseError);
    await expect(execution).rejects.toMatchObject({
      code: "VOICEVOX_REQUEST_FAILED",
    });
  });

  it("想定外エラーはそのまま伝播する", async () => {
    const unexpectedError = new Error("unexpected");
    const voicevoxClient: VoicevoxClient = {
      fetchSpeakers: vi.fn().mockRejectedValue(unexpectedError),
      synthesize: vi.fn(),
    };

    const useCase = new GetVoicevoxSpeakersInteractor(voicevoxClient);

    await expect(useCase.execute()).rejects.toBe(unexpectedError);
  });
});
