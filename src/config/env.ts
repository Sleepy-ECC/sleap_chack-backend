import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(8080),
  APP_NAME: z.string().min(1).default("hitsujii-sleep-school-backend"),
  CORS_ORIGINS: z
    .string()
    .optional()
    .transform((value) =>
      value
        ?.split(",")
        .map((origin) => origin.trim())
        .filter(Boolean) ?? ["http://localhost:3000", "http://localhost:5173"],
    ),
  DATABASE_URL: z.url(),
  DATABASE_SSL: z
    .string()
    .optional()
    .transform((value) => value === "true"),
  JWT_ISSUER: z.string().min(1),
  JWT_AUDIENCE: z.string().min(1),
  JWT_SECRET: z.string().min(32),
  GOOGLE_CLOUD_PROJECT: z.string().min(1),
  GCS_BUCKET: z.string().min(1),
  VOICEVOX_API_BASE_URL: z.url(),
});

export type AppEnv = z.infer<typeof envSchema>;

export const env = envSchema.parse(process.env);
