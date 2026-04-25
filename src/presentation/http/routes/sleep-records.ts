import { Hono } from "hono";
import { z } from "zod";

import type { CreateSleepRecordUseCase } from "../../../application/sleep-records/usecases/create-sleep-record.js";
import type { ListSleepRecordsUseCase } from "../../../application/sleep-records/usecases/list-sleep-records.js";
import { toSleepRecordErrorResponse } from "../presenters/sleep-record-error-presenter.js";
import { toSleepRecordSuccessResponse } from "../presenters/sleep-record-success-presenter.js";
import { toSleepRecordsResponse } from "../presenters/sleep-records-presenter.js";
import { toValidationErrorResponse } from "../presenters/validation-error-presenter.js";
import { parseJson } from "../requests/parse-json.js";

const createSleepRecordSchema = z.object({
  userId: z.uuid(),
  sleepMethodId: z.uuid(),
  sleepDate: z.iso.date(),
  sleptMinutes: z.number().int().positive(),
});

const listSleepRecordsQuerySchema = z.object({
  userId: z.uuid(),
});

export const createSleepRecordsRouter = (deps: {
  createSleepRecordUseCase: CreateSleepRecordUseCase;
  listSleepRecordsUseCase: ListSleepRecordsUseCase;
}) => {
  const sleepRecordsRouter = new Hono();

  sleepRecordsRouter.get("/", async (c) => {
    const queryResult = listSleepRecordsQuerySchema.safeParse({
      userId: c.req.query("userId"),
    });

    if (!queryResult.success) {
      const validationError = toValidationErrorResponse(queryResult.error);
      return c.json(validationError.body, validationError.status);
    }

    const sleepRecordsResult = await deps.listSleepRecordsUseCase.execute(queryResult.data);
    return c.json(toSleepRecordsResponse(sleepRecordsResult));
  });

  sleepRecordsRouter.post("/", async (c) => {
    const result = await parseJson(c.req.raw, createSleepRecordSchema);

    if (!result.success) {
      const validationError = toValidationErrorResponse(result.error);
      return c.json(validationError.body, validationError.status);
    }

    try {
      const sleepRecordResult = await deps.createSleepRecordUseCase.execute(result.data);
      return c.json(toSleepRecordSuccessResponse(sleepRecordResult), 201);
    } catch (error) {
      const sleepRecordError = toSleepRecordErrorResponse(error);
      return c.json(sleepRecordError.body, sleepRecordError.status);
    }
  });

  return sleepRecordsRouter;
};

export type SleepRecordsRouterDependencies = Parameters<typeof createSleepRecordsRouter>[0];
