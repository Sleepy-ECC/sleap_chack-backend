import { config } from "dotenv";
import { serve } from "@hono/node-server";

config();

const main = async () => {
  const [{ app }, { env }] = await Promise.all([import("./app.js"), import("./config/env.js")]);

  serve(
    {
      fetch: app.fetch,
      port: env.PORT,
    },
    (info) => {
      console.log(`${env.APP_NAME} listening on http://localhost:${info.port}`);
    },
  );
};

void main();
