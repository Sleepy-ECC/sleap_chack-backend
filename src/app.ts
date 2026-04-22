import { Hono } from "hono";
import { logger } from "hono/logger";

import { env } from "./config/env.js";
import { createAuthRouter, type AuthRouterDependencies } from "./presentation/http/routes/auth.js";

export const createApp = (deps: {
  authModule: AuthRouterDependencies;
}) => {
  const app = new Hono();

  app.use("*", logger());
  app.route("/auth", createAuthRouter(deps.authModule));

  app.get("/healthz", (c) =>
    c.json({
      ok: true,
      service: env.APP_NAME,
      env: env.NODE_ENV,
    }),
  );

  return app;
};
