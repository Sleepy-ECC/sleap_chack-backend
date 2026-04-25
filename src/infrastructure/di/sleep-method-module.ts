import { ListSleepMethodsInteractor, type ListSleepMethodsUseCase } from "../../application/sleep-methods/usecases/list-sleep-methods.js";
import { DrizzleSleepMethodRepository } from "../sleep-methods/drizzle-sleep-method-repository.js";

export type SleepMethodDependencies = {
  listSleepMethodsUseCase: ListSleepMethodsUseCase;
};

export const createSleepMethodDependencies = (): SleepMethodDependencies => {
  const sleepMethodRepository = new DrizzleSleepMethodRepository();

  return {
    listSleepMethodsUseCase: new ListSleepMethodsInteractor(sleepMethodRepository),
  };
};
