import { ListSleepMethodsInteractor, type ListSleepMethodsUseCase } from "../../application/sleep-methods/usecases/list-sleep-methods.js";
import { DrizzleSleepMethodRepository } from "../sleep-methods/drizzle-sleep-method-repository.js";

export type SleepMethodModule = {
  listSleepMethodsUseCase: ListSleepMethodsUseCase;
};

export const createSleepMethodModule = (): SleepMethodModule => {
  const sleepMethodRepository = new DrizzleSleepMethodRepository();

  return {
    listSleepMethodsUseCase: new ListSleepMethodsInteractor(sleepMethodRepository),
  };
};
