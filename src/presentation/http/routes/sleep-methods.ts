import { Hono } from "hono";

import type { ListSleepMethodsUseCase } from "../../../application/sleep-methods/usecases/list-sleep-methods.js";
import { toSleepMethodsResponse } from "../presenters/sleep-methods-presenter.js";

export const createSleepMethodsRouter = (deps: {
  listSleepMethodsUseCase: ListSleepMethodsUseCase;
}) => {
  const sleepMethodsRouter = new Hono();

  sleepMethodsRouter.get("/", async (c) => {
    const result = await deps.listSleepMethodsUseCase.execute();
    return c.json(toSleepMethodsResponse(result));
  });

  return sleepMethodsRouter;
};

export type SleepMethodsRouterDependencies = Parameters<typeof createSleepMethodsRouter>[0];
