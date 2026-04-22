import { z } from "zod";

export const toValidationErrorResponse = (error: z.ZodError) => ({
  status: 400 as const,
  body: {
    ok: false,
    error: "INVALID_REQUEST",
    issues: z.flattenError(error).fieldErrors,
  },
});
