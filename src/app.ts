import { Hono } from "hono";
import { logger } from "hono/logger";

import { env } from "./config/env.js";

export const app = new Hono();

app.use("*", logger());

app.get("/healthz", (c) =>
  c.json({
    ok: true,
    service: env.APP_NAME,
    env: env.NODE_ENV,
  }),
);
