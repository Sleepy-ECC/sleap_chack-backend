import { SleepRecordUseCaseError } from "../errors/sleep-record-use-case-error.js";
import type { SleepRecord } from "../models/sleep-record.js";
import { InvalidSleepRecordReferenceError, type CreateSleepRecordInput, type SleepRecordRepository } from "../repositories/sleep-record-repository.js";

export type CreateSleepRecordResult = {
  sleepRecord: SleepRecord;
};

export interface CreateSleepRecordUseCase {
  execute(input: CreateSleepRecordInput): Promise<CreateSleepRecordResult>;
}

export class CreateSleepRecordInteractor implements CreateSleepRecordUseCase {
  constructor(private readonly sleepRecordRepository: SleepRecordRepository) {}

  async execute(input: CreateSleepRecordInput): Promise<CreateSleepRecordResult> {
    try {
      const sleepRecord = await this.sleepRecordRepository.create(input);
      return { sleepRecord };
    } catch (error) {
      if (error instanceof InvalidSleepRecordReferenceError) {
        throw new SleepRecordUseCaseError("INVALID_SLEEP_RECORD_REFERENCE");
      }

      throw error;
    }
  }
}
