import type { GetVoicevoxSpeakersResult } from "../../../application/voicevox/usecases/get-speakers.js";

export const toVoicevoxSpeakersResponse = (result: GetVoicevoxSpeakersResult) => ({
  ok: true as const,
  voices: result.speakers.flatMap((speaker) =>
    speaker.styles.map((style) => ({
      speaker: style.id,
      speakerName: speaker.name,
      styleName: style.name,
      styleType: style.type,
      speakerUuid: speaker.speaker_uuid,
      version: speaker.version,
      label: `${speaker.name} / ${style.name}`,
    })),
  ),
});
