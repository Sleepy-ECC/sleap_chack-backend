import { z } from "zod";

export const registerSchema = z.object({
  email: z.email().max(255),
  password: z.string().min(8).max(72),
  displayName: z.string().trim().min(1).max(100).optional(),
});

export const loginSchema = z.object({
  email: z.email().max(255),
  password: z.string().min(8).max(72),
});
