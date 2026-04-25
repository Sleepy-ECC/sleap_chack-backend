import type { ListSleepRecordsResult } from "../../../application/sleep-records/usecases/list-sleep-records.js";

export const toSleepRecordsResponse = (result: ListSleepRecordsResult) => ({
  ok: true as const,
  sleepRecords: result.sleepRecords.map((sleepRecord) => ({
    id: sleepRecord.id,
    userId: sleepRecord.userId,
    sleepMethodId: sleepRecord.sleepMethodId,
    sleepDate: sleepRecord.sleepDate,
    sleptMinutes: sleepRecord.sleptMinutes,
    createdAt: sleepRecord.createdAt.toISOString(),
  })),
});
