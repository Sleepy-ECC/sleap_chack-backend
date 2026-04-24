import type { ListSleepMethodsResult } from "../../../application/sleep-methods/usecases/list-sleep-methods.js";

export const toSleepMethodsResponse = (result: ListSleepMethodsResult) => ({
  ok: true as const,
  sleepMethods: result.sleepMethods.map((sleepMethod) => ({
    id: sleepMethod.id,
    code: sleepMethod.code,
    name: sleepMethod.name,
    description: sleepMethod.description,
    category: sleepMethod.category,
    hasAudio: sleepMethod.hasAudio,
  })),
});
