import type { SleepRecord } from "../../application/sleep-records/models/sleep-record.js";
import { InvalidSleepRecordReferenceError, type CreateSleepRecordInput, type SleepRecordRepository } from "../../application/sleep-records/repositories/sleep-record-repository.js";
import { db } from "../../db/client.js";
import { sleepRecords } from "../../db/schema.js";

const sleepRecordSelection = {
  id: sleepRecords.id,
  userId: sleepRecords.userId,
  sleepMethodId: sleepRecords.sleepMethodId,
  sleepDate: sleepRecords.sleepDate,
  sleptMinutes: sleepRecords.sleptMinutes,
  createdAt: sleepRecords.createdAt,
};

export class DrizzleSleepRecordRepository implements SleepRecordRepository {
  async create(input: CreateSleepRecordInput): Promise<SleepRecord> {
    try {
      const [sleepRecord] = await db
        .insert(sleepRecords)
        .values({
          userId: input.userId,
          sleepMethodId: input.sleepMethodId,
          sleepDate: input.sleepDate,
          sleptMinutes: input.sleptMinutes,
        })
        .returning(sleepRecordSelection);

      return sleepRecord;
    } catch (error) {
      const dbError = error as { code?: string };

      if (dbError.code === "23503") {
        throw new InvalidSleepRecordReferenceError();
      }

      throw error;
    }
  }
}
