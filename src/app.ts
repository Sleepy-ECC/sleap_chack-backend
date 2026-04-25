import { Hono } from "hono";
import { logger } from "hono/logger";

import { env } from "./config/env.js";
import type { TokenVerifier } from "./application/auth/services/token-verifier.js";
import { createAuthRouter, type AuthRouterDependencies } from "./presentation/http/routes/auth.js";
import { createSleepRecordsRouter, type SleepRecordsRouterDependencies } from "./presentation/http/routes/sleep-records.js";
import { createSleepMethodsRouter, type SleepMethodsRouterDependencies } from "./presentation/http/routes/sleep-methods.js";
import { createVoicevoxRouter, type VoicevoxRouterDependencies } from "./presentation/http/routes/voicevox.js";

export const createApp = (deps: {
  authDependencies: AuthRouterDependencies & { tokenVerifier: TokenVerifier };
  sleepRecordDependencies: Omit<SleepRecordsRouterDependencies, "tokenVerifier">;
  sleepMethodDependencies: SleepMethodsRouterDependencies;
  voicevoxDependencies: VoicevoxRouterDependencies;
}) => {
  const app = new Hono();

  app.use("*", logger());
  app.route("/auth", createAuthRouter(deps.authDependencies));
  app.route(
    "/sleep-records",
    createSleepRecordsRouter({
      ...deps.sleepRecordDependencies,
      tokenVerifier: deps.authDependencies.tokenVerifier,
    }),
  );
  app.route("/sleep-methods", createSleepMethodsRouter(deps.sleepMethodDependencies));
  app.route("/voicevox", createVoicevoxRouter(deps.voicevoxDependencies));

  app.get("/healthz", (c) =>
    c.json({
      ok: true,
      service: env.APP_NAME,
      env: env.NODE_ENV,
    }),
  );

  return app;
};
