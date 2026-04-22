import { VoicevoxUseCaseError } from "../errors/voicevox-use-case-error.js";
import { VoicevoxRequestError, type SynthesizeVoiceInput, type SynthesizeVoiceResult, type VoicevoxClient } from "../services/voicevox-client.js";

export interface SynthesizeVoiceUseCase {
  execute(input: SynthesizeVoiceInput): Promise<SynthesizeVoiceResult>;
}

export class SynthesizeVoiceInteractor implements SynthesizeVoiceUseCase {
  constructor(private readonly voicevoxClient: VoicevoxClient) {}

  async execute(input: SynthesizeVoiceInput): Promise<SynthesizeVoiceResult> {
    try {
      return await this.voicevoxClient.synthesize(input);
    } catch (error) {
      if (error instanceof VoicevoxRequestError) {
        throw new VoicevoxUseCaseError("VOICEVOX_REQUEST_FAILED");
      }

      throw error;
    }
  }
}
