export type VoicevoxStyle = {
  id: number;
  name: string;
  type: string;
};

export type VoicevoxSpeaker = {
  name: string;
  speaker_uuid: string;
  styles: VoicevoxStyle[];
  version: string;
};

export type SynthesizeVoiceInput = {
  text: string;
  speaker: number;
};

export type SynthesizeVoiceResult = {
  audio: ArrayBuffer;
  contentType: string;
};

export interface VoicevoxClient {
  fetchSpeakers(): Promise<VoicevoxSpeaker[]>;
  synthesize(input: SynthesizeVoiceInput): Promise<SynthesizeVoiceResult>;
}

export class VoicevoxRequestError extends Error {
  constructor(message = "VOICEVOX_REQUEST_FAILED") {
    super(message);
    this.name = "VoicevoxRequestError";
  }
}
