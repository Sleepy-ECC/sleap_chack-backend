import { Hono } from "hono";
import { z } from "zod";

import type { LoginUserUseCase } from "../../../application/auth/usecases/login-user.js";
import type { RegisterUserUseCase } from "../../../application/auth/usecases/register-user.js";
import { toAuthErrorResponse } from "../presenters/auth-error-presenter.js";
import { toAuthSuccessResponse } from "../presenters/auth-success-presenter.js";
import { toValidationErrorResponse } from "../presenters/validation-error-presenter.js";
import { loginSchema, registerSchema } from "../schemas/auth-schema.js";

const parseJson = async <T>(request: Request, schema: z.ZodType<T>) => {
  const body = await request.json().catch(() => null);
  return schema.safeParse(body);
};

export const createAuthRouter = (deps: {
  registerUserUseCase: RegisterUserUseCase;
  loginUserUseCase: LoginUserUseCase;
}) => {
  const authRouter = new Hono();

  authRouter.post("/register", async (c) => {
    const result = await parseJson(c.req.raw, registerSchema);

    if (!result.success) {
      const validationError = toValidationErrorResponse(result.error);
      return c.json(validationError.body, validationError.status);
    }

    try {
      const authResult = await deps.registerUserUseCase.execute(result.data);
      return c.json(toAuthSuccessResponse(authResult), 201);
    } catch (error) {
      const authError = toAuthErrorResponse(error);
      return c.json(authError.body, authError.status);
    }
  });

  authRouter.post("/login", async (c) => {
    const result = await parseJson(c.req.raw, loginSchema);

    if (!result.success) {
      const validationError = toValidationErrorResponse(result.error);
      return c.json(validationError.body, validationError.status);
    }

    try {
      const authResult = await deps.loginUserUseCase.execute(result.data);
      return c.json(toAuthSuccessResponse(authResult));
    } catch (error) {
      const authError = toAuthErrorResponse(error);
      return c.json(authError.body, authError.status);
    }
  });

  return authRouter;
};

export type AuthRouterDependencies = Parameters<typeof createAuthRouter>[0];
