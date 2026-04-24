import { Hono } from "hono";
import { logger } from "hono/logger";

import { env } from "./config/env.js";
import { createAuthRouter, type AuthRouterDependencies } from "./presentation/http/routes/auth.js";
import { createSleepRecordsRouter, type SleepRecordsRouterDependencies } from "./presentation/http/routes/sleep-records.js";
import { createSleepMethodsRouter, type SleepMethodsRouterDependencies } from "./presentation/http/routes/sleep-methods.js";
import { createVoicevoxRouter, type VoicevoxRouterDependencies } from "./presentation/http/routes/voicevox.js";

export const createApp = (deps: {
  authModule: AuthRouterDependencies;
  sleepRecordModule: SleepRecordsRouterDependencies;
  sleepMethodModule: SleepMethodsRouterDependencies;
  voicevoxModule: VoicevoxRouterDependencies;
}) => {
  const app = new Hono();

  app.use("*", logger());
  app.route("/auth", createAuthRouter(deps.authModule));
  app.route("/sleep-records", createSleepRecordsRouter(deps.sleepRecordModule));
  app.route("/sleep-methods", createSleepMethodsRouter(deps.sleepMethodModule));
  app.route("/voicevox", createVoicevoxRouter(deps.voicevoxModule));

  app.get("/healthz", (c) =>
    c.json({
      ok: true,
      service: env.APP_NAME,
      env: env.NODE_ENV,
    }),
  );

  return app;
};
