import { SleepRecordUseCaseError } from "../../../application/sleep-records/errors/sleep-record-use-case-error.js";

export const toSleepRecordErrorResponse = (error: unknown) => {
  if (!(error instanceof SleepRecordUseCaseError)) {
    throw error;
  }

  return {
    status: 400 as const,
    body: {
      ok: false,
      error: error.code,
    },
  };
};
