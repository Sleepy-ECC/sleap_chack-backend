import type { SleepRecord } from "../models/sleep-record.js";
import type { SleepRecordRepository } from "../repositories/sleep-record-repository.js";

export type ListSleepRecordsInput = {
  userId: string;
};

export type ListSleepRecordsResult = {
  sleepRecords: SleepRecord[];
};

export interface ListSleepRecordsUseCase {
  execute(input: ListSleepRecordsInput): Promise<ListSleepRecordsResult>;
}

export class ListSleepRecordsInteractor implements ListSleepRecordsUseCase {
  constructor(private readonly sleepRecordRepository: SleepRecordRepository) {}

  async execute(input: ListSleepRecordsInput): Promise<ListSleepRecordsResult> {
    const sleepRecords = await this.sleepRecordRepository.findByUserId(input.userId);
    return { sleepRecords };
  }
}
