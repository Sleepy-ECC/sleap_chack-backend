import { VoicevoxUseCaseError } from "../errors/voicevox-use-case-error.js";
import { VoicevoxRequestError, type VoicevoxClient, type VoicevoxSpeaker } from "../services/voicevox-client.js";

export type GetVoicevoxSpeakersResult = {
  speakers: VoicevoxSpeaker[];
};

export interface GetVoicevoxSpeakersUseCase {
  execute(): Promise<GetVoicevoxSpeakersResult>;
}

export class GetVoicevoxSpeakersInteractor implements GetVoicevoxSpeakersUseCase {
  constructor(private readonly voicevoxClient: VoicevoxClient) {}

  async execute(): Promise<GetVoicevoxSpeakersResult> {
    try {
      const speakers = await this.voicevoxClient.fetchSpeakers();
      return { speakers };
    } catch (error) {
      if (error instanceof VoicevoxRequestError) {
        throw new VoicevoxUseCaseError("VOICEVOX_REQUEST_FAILED");
      }

      throw error;
    }
  }
}
