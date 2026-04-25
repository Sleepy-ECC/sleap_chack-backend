import { createMiddleware } from "hono/factory";

import { InvalidAccessTokenError, type AuthenticatedUser, type TokenVerifier } from "../../../application/auth/services/token-verifier.js";

export type AuthenticationVariables = {
  auth: AuthenticatedUser;
};

export type AuthenticationDependencies = {
  tokenVerifier: TokenVerifier;
};

export const createAuthenticationMiddleware = (deps: AuthenticationDependencies) =>
  createMiddleware<{ Variables: AuthenticationVariables }>(async (c, next) => {
    const authorization = c.req.header("authorization");

    if (!authorization?.startsWith("Bearer ")) {
      return c.json(
        {
          ok: false,
          error: "UNAUTHORIZED",
        },
        401,
      );
    }

    const accessToken = authorization.slice("Bearer ".length).trim();

    try {
      const auth = deps.tokenVerifier.verifyAccessToken(accessToken);
      c.set("auth", auth);
      await next();
    } catch (error) {
      if (!(error instanceof InvalidAccessTokenError)) {
        throw error;
      }

      return c.json(
        {
          ok: false,
          error: "UNAUTHORIZED",
        },
        401,
      );
    }
  });
