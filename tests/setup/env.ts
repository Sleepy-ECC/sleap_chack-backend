import { config } from "dotenv";

config({
  path: ".env.test",
  quiet: true,
  override: true,
});
