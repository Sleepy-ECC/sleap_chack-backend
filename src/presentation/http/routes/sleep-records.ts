import { Hono } from "hono";
import { z } from "zod";

import type { TokenVerifier } from "../../../application/auth/services/token-verifier.js";
import type { CreateSleepRecordUseCase } from "../../../application/sleep-records/usecases/create-sleep-record.js";
import type { ListSleepRecordsUseCase } from "../../../application/sleep-records/usecases/list-sleep-records.js";
import { createAuthenticationMiddleware, type AuthenticationVariables } from "../middleware/authenticate.js";
import { toSleepRecordErrorResponse } from "../presenters/sleep-record-error-presenter.js";
import { toSleepRecordSuccessResponse } from "../presenters/sleep-record-success-presenter.js";
import { toSleepRecordsResponse } from "../presenters/sleep-records-presenter.js";
import { toValidationErrorResponse } from "../presenters/validation-error-presenter.js";
import { parseJson } from "../requests/parse-json.js";

const createSleepRecordSchema = z.object({
  sleepMethodId: z.uuid(),
  sleepDate: z.iso.date(),
  sleptMinutes: z.number().int().positive(),
});

export const createSleepRecordsRouter = (deps: {
  createSleepRecordUseCase: CreateSleepRecordUseCase;
  listSleepRecordsUseCase: ListSleepRecordsUseCase;
  tokenVerifier: TokenVerifier;
}) => {
  const sleepRecordsRouter = new Hono<{ Variables: AuthenticationVariables }>();

  sleepRecordsRouter.use("*", createAuthenticationMiddleware(deps));

  sleepRecordsRouter.get("/", async (c) => {
    const auth = c.get("auth");
    const sleepRecordsResult = await deps.listSleepRecordsUseCase.execute({
      userId: auth.userId,
    });
    return c.json(toSleepRecordsResponse(sleepRecordsResult));
  });

  sleepRecordsRouter.post("/", async (c) => {
    const result = await parseJson(c.req.raw, createSleepRecordSchema);

    if (!result.success) {
      const validationError = toValidationErrorResponse(result.error);
      return c.json(validationError.body, validationError.status);
    }

    try {
      const auth = c.get("auth");
      const sleepRecordResult = await deps.createSleepRecordUseCase.execute({
        ...result.data,
        userId: auth.userId,
      });
      return c.json(toSleepRecordSuccessResponse(sleepRecordResult), 201);
    } catch (error) {
      const sleepRecordError = toSleepRecordErrorResponse(error);
      return c.json(sleepRecordError.body, sleepRecordError.status);
    }
  });

  return sleepRecordsRouter;
};

export type SleepRecordsRouterDependencies = Parameters<typeof createSleepRecordsRouter>[0];
