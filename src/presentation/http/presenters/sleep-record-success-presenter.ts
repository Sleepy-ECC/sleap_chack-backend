import type { CreateSleepRecordResult } from "../../../application/sleep-records/usecases/create-sleep-record.js";

export const toSleepRecordSuccessResponse = (result: CreateSleepRecordResult) => ({
  ok: true as const,
  sleepRecord: {
    id: result.sleepRecord.id,
    userId: result.sleepRecord.userId,
    sleepMethodId: result.sleepRecord.sleepMethodId,
    sleepDate: result.sleepRecord.sleepDate,
    sleptMinutes: result.sleepRecord.sleptMinutes,
    createdAt: result.sleepRecord.createdAt.toISOString(),
  },
});
