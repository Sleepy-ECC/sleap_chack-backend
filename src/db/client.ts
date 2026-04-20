import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { env } from "../config/env.js";
import * as schema from "./schema.js";

const queryClient = postgres(env.DATABASE_URL, {
  ssl: env.DATABASE_SSL ? "require" : undefined,
  max: env.NODE_ENV === "production" ? 10 : 1,
  prepare: false,
});

export const db = drizzle(queryClient, { schema });
export { queryClient };
