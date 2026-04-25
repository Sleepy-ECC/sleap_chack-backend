import { CreateSleepRecordInteractor, type CreateSleepRecordUseCase } from "../../application/sleep-records/usecases/create-sleep-record.js";
import { ListSleepRecordsInteractor, type ListSleepRecordsUseCase } from "../../application/sleep-records/usecases/list-sleep-records.js";
import { DrizzleSleepRecordRepository } from "../sleep-records/drizzle-sleep-record-repository.js";

export type SleepRecordDependencies = {
  createSleepRecordUseCase: CreateSleepRecordUseCase;
  listSleepRecordsUseCase: ListSleepRecordsUseCase;
};

export const createSleepRecordDependencies = (): SleepRecordDependencies => {
  const sleepRecordRepository = new DrizzleSleepRecordRepository();

  return {
    createSleepRecordUseCase: new CreateSleepRecordInteractor(sleepRecordRepository),
    listSleepRecordsUseCase: new ListSleepRecordsInteractor(sleepRecordRepository),
  };
};
