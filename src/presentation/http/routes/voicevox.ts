import { Hono } from "hono";
import { z } from "zod";

import type { GetVoicevoxSpeakersUseCase } from "../../../application/voicevox/usecases/get-speakers.js";
import type { SynthesizeVoiceUseCase } from "../../../application/voicevox/usecases/synthesize-voice.js";
import { toValidationErrorResponse } from "../presenters/validation-error-presenter.js";
import { toVoicevoxErrorResponse } from "../presenters/voicevox-error-presenter.js";
import { toVoicevoxSpeakersResponse } from "../presenters/voicevox-speakers-presenter.js";
import { parseJson } from "../requests/parse-json.js";

const synthesizeVoiceSchema = z.object({
  text: z.string().trim().min(1).max(500),
  speaker: z.number().int().nonnegative(),
});

export const createVoicevoxRouter = (deps: {
  getVoicevoxSpeakersUseCase: GetVoicevoxSpeakersUseCase;
  synthesizeVoiceUseCase: SynthesizeVoiceUseCase;
}) => {
  const voicevoxRouter = new Hono();

  voicevoxRouter.get("/speakers", async (c) => {
    try {
      const result = await deps.getVoicevoxSpeakersUseCase.execute();
      return c.json(toVoicevoxSpeakersResponse(result));
    } catch (error) {
      const voicevoxError = toVoicevoxErrorResponse(error);
      return c.json(voicevoxError.body, voicevoxError.status);
    }
  });

  voicevoxRouter.post("/synthesis", async (c) => {
    const result = await parseJson(c.req.raw, synthesizeVoiceSchema);

    if (!result.success) {
      const validationError = toValidationErrorResponse(result.error);
      return c.json(validationError.body, validationError.status);
    }

    try {
      const synthesisResult = await deps.synthesizeVoiceUseCase.execute(result.data);
      return new Response(synthesisResult.audio, {
        status: 200,
        headers: {
          "content-type": synthesisResult.contentType,
        },
      });
    } catch (error) {
      const voicevoxError = toVoicevoxErrorResponse(error);
      return c.json(voicevoxError.body, voicevoxError.status);
    }
  });

  return voicevoxRouter;
};

export type VoicevoxRouterDependencies = Parameters<typeof createVoicevoxRouter>[0];
