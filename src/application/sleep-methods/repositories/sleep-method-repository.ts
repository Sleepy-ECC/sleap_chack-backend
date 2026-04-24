import type { SleepMethod } from "../models/sleep-method.js";

export interface SleepMethodRepository {
  findActiveAll(): Promise<SleepMethod[]>;
}
