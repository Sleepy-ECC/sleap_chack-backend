import { config } from "dotenv";
import { serve } from "@hono/node-server";

config();

const main = async () => {
  const [{ bootstrapApp }, { env }] = await Promise.all([
    import("./bootstrap/create-app.js"),
    import("./config/env.js"),
  ]);

  const app = bootstrapApp();

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
