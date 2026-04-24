import { asc, eq } from "drizzle-orm";

import type { SleepMethod } from "../../application/sleep-methods/models/sleep-method.js";
import type { SleepMethodRepository } from "../../application/sleep-methods/repositories/sleep-method-repository.js";
import { db } from "../../db/client.js";
import { sleepMethods } from "../../db/schema.js";

const sleepMethodSelection = {
  id: sleepMethods.id,
  code: sleepMethods.code,
  name: sleepMethods.name,
  description: sleepMethods.description,
  category: sleepMethods.category,
  hasAudio: sleepMethods.hasAudio,
  isActive: sleepMethods.isActive,
  createdAt: sleepMethods.createdAt,
  updatedAt: sleepMethods.updatedAt,
};

export class DrizzleSleepMethodRepository implements SleepMethodRepository {
  async findActiveAll(): Promise<SleepMethod[]> {
    return db
      .select(sleepMethodSelection)
      .from(sleepMethods)
      .where(eq(sleepMethods.isActive, true))
      .orderBy(asc(sleepMethods.name));
  }
}
