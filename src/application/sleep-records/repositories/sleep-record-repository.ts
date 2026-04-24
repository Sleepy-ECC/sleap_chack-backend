import type { SleepRecord } from "../models/sleep-record.js";

export type CreateSleepRecordInput = {
  userId: string;
  sleepMethodId: string;
  sleepDate: string;
  sleptMinutes: number;
};

export class InvalidSleepRecordReferenceError extends Error {
  constructor(message = "INVALID_SLEEP_RECORD_REFERENCE") {
    super(message);
    this.name = "InvalidSleepRecordReferenceError";
  }
}

export interface SleepRecordRepository {
  create(input: CreateSleepRecordInput): Promise<SleepRecord>;
}
