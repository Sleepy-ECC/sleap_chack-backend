import type { SleepMethod } from "../models/sleep-method.js";
import type { SleepMethodRepository } from "../repositories/sleep-method-repository.js";

export type ListSleepMethodsResult = {
  sleepMethods: SleepMethod[];
};

export interface ListSleepMethodsUseCase {
  execute(): Promise<ListSleepMethodsResult>;
}

export class ListSleepMethodsInteractor implements ListSleepMethodsUseCase {
  constructor(private readonly sleepMethodRepository: SleepMethodRepository) {}

  async execute(): Promise<ListSleepMethodsResult> {
    const sleepMethods = await this.sleepMethodRepository.findActiveAll();
    return { sleepMethods };
  }
}
