import { describe, expect, it, vi } from "vitest";

import { VoicevoxUseCaseError } from "../../../../src/application/voicevox/errors/voicevox-use-case-error.js";
import { VoicevoxRequestError, type SynthesizeVoiceResult, type VoicevoxClient } from "../../../../src/application/voicevox/services/voicevox-client.js";
import { SynthesizeVoiceInteractor } from "../../../../src/application/voicevox/usecases/synthesize-voice.js";

describe("SynthesizeVoiceInteractor", () => {
  it("音声合成結果を返す", async () => {
    const synthesisResult: SynthesizeVoiceResult = {
      audio: new TextEncoder().encode("voice").buffer,
      contentType: "audio/wav",
    };
    const voicevoxClient: VoicevoxClient = {
      fetchSpeakers: vi.fn(),
      synthesize: vi.fn().mockResolvedValue(synthesisResult),
    };

    const useCase = new SynthesizeVoiceInteractor(voicevoxClient);

    await expect(
      useCase.execute({
        text: "こんにちは",
        speaker: 1,
      }),
    ).resolves.toEqual(synthesisResult);
  });

  it("VOICEVOX のリクエストエラーを application エラーへ変換する", async () => {
    const voicevoxClient: VoicevoxClient = {
      fetchSpeakers: vi.fn(),
      synthesize: vi.fn().mockRejectedValue(new VoicevoxRequestError()),
    };

    const useCase = new SynthesizeVoiceInteractor(voicevoxClient);
    const execution = useCase.execute({
      text: "こんにちは",
      speaker: 1,
    });

    await expect(execution).rejects.toBeInstanceOf(VoicevoxUseCaseError);
    await expect(execution).rejects.toMatchObject({
      code: "VOICEVOX_REQUEST_FAILED",
    });
  });

  it("想定外エラーはそのまま伝播する", async () => {
    const unexpectedError = new Error("unexpected");
    const voicevoxClient: VoicevoxClient = {
      fetchSpeakers: vi.fn(),
      synthesize: vi.fn().mockRejectedValue(unexpectedError),
    };

    const useCase = new SynthesizeVoiceInteractor(voicevoxClient);

    await expect(
      useCase.execute({
        text: "こんにちは",
        speaker: 1,
      }),
    ).rejects.toBe(unexpectedError);
  });
});
