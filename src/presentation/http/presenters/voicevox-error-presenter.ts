import { VoicevoxUseCaseError } from "../../../application/voicevox/errors/voicevox-use-case-error.js";

export const toVoicevoxErrorResponse = (error: unknown) => {
  if (!(error instanceof VoicevoxUseCaseError)) {
    throw error;
  }

  return {
    status: 502 as const,
    body: {
      ok: false,
      error: error.code,
    },
  };
};
