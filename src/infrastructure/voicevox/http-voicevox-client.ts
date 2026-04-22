import { env } from "../../config/env.js";
import { VoicevoxRequestError, type SynthesizeVoiceInput, type SynthesizeVoiceResult, type VoicevoxClient, type VoicevoxSpeaker } from "../../application/voicevox/services/voicevox-client.js";

export class HttpVoicevoxClient implements VoicevoxClient {
  async fetchSpeakers(): Promise<VoicevoxSpeaker[]> {
    const response = await fetch(this.buildUrl("/speakers"));

    if (!response.ok) {
      throw new VoicevoxRequestError();
    }

    return response.json() as Promise<VoicevoxSpeaker[]>;
  }

  async synthesize(input: SynthesizeVoiceInput): Promise<SynthesizeVoiceResult> {
    const audioQueryResponse = await fetch(
      this.buildUrl(`/audio_query?${new URLSearchParams({
        text: input.text,
        speaker: String(input.speaker),
      }).toString()}`),
      {
        method: "POST",
      },
    );

    if (!audioQueryResponse.ok) {
      throw new VoicevoxRequestError();
    }

    const audioQuery = await audioQueryResponse.json();
    const synthesisResponse = await fetch(
      this.buildUrl(`/synthesis?${new URLSearchParams({
        speaker: String(input.speaker),
      }).toString()}`),
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify(audioQuery),
      },
    );

    if (!synthesisResponse.ok) {
      throw new VoicevoxRequestError();
    }

    return {
      audio: await synthesisResponse.arrayBuffer(),
      contentType: synthesisResponse.headers.get("content-type") ?? "audio/wav",
    };
  }

  private buildUrl(path: string) {
    return new URL(path, env.VOICEVOX_API_BASE_URL).toString();
  }
}
