import type { ZodType } from "zod";

export const parseJson = async <T>(request: Request, schema: ZodType<T>) => {
  const body = await request.json().catch(() => null);
  return schema.safeParse(body);
};
