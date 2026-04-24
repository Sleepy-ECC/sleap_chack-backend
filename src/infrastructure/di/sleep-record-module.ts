import { CreateSleepRecordInteractor, type CreateSleepRecordUseCase } from "../../application/sleep-records/usecases/create-sleep-record.js";
import { DrizzleSleepRecordRepository } from "../sleep-records/drizzle-sleep-record-repository.js";

export type SleepRecordModule = {
  createSleepRecordUseCase: CreateSleepRecordUseCase;
};

export const createSleepRecordModule = (): SleepRecordModule => {
  const sleepRecordRepository = new DrizzleSleepRecordRepository();

  return {
    createSleepRecordUseCase: new CreateSleepRecordInteractor(sleepRecordRepository),
  };
};
