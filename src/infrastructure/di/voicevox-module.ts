import { GetVoicevoxSpeakersInteractor, type GetVoicevoxSpeakersUseCase } from "../../application/voicevox/usecases/get-speakers.js";
import { SynthesizeVoiceInteractor, type SynthesizeVoiceUseCase } from "../../application/voicevox/usecases/synthesize-voice.js";
import { HttpVoicevoxClient } from "../voicevox/http-voicevox-client.js";

export type VoicevoxModule = {
  getVoicevoxSpeakersUseCase: GetVoicevoxSpeakersUseCase;
  synthesizeVoiceUseCase: SynthesizeVoiceUseCase;
};

export const createVoicevoxModule = (): VoicevoxModule => {
  const voicevoxClient = new HttpVoicevoxClient();

  return {
    getVoicevoxSpeakersUseCase: new GetVoicevoxSpeakersInteractor(voicevoxClient),
    synthesizeVoiceUseCase: new SynthesizeVoiceInteractor(voicevoxClient),
  };
};
