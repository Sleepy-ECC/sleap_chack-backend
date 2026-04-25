import { GetVoicevoxSpeakersInteractor, type GetVoicevoxSpeakersUseCase } from "../../application/voicevox/usecases/get-speakers.js";
import { SynthesizeVoiceInteractor, type SynthesizeVoiceUseCase } from "../../application/voicevox/usecases/synthesize-voice.js";
import { HttpVoicevoxClient } from "../voicevox/http-voicevox-client.js";

export type VoicevoxDependencies = {
  getVoicevoxSpeakersUseCase: GetVoicevoxSpeakersUseCase;
  synthesizeVoiceUseCase: SynthesizeVoiceUseCase;
};

export const createVoicevoxDependencies = (): VoicevoxDependencies => {
  const voicevoxClient = new HttpVoicevoxClient();

  return {
    getVoicevoxSpeakersUseCase: new GetVoicevoxSpeakersInteractor(voicevoxClient),
    synthesizeVoiceUseCase: new SynthesizeVoiceInteractor(voicevoxClient),
  };
};
