import jwt from "jsonwebtoken";
import { z } from "zod";

import type { TokenVerifier } from "../../application/auth/services/token-verifier.js";
import { InvalidAccessTokenError } from "../../application/auth/services/token-verifier.js";
import { env } from "../../config/env.js";

const accessTokenPayloadSchema = z.object({
  sub: z.uuid(),
  email: z.email(),
});

export class JwtTokenVerifier implements TokenVerifier {
  verifyAccessToken(token: string) {
    try {
      const decoded = jwt.verify(token, env.JWT_SECRET, {
        issuer: env.JWT_ISSUER,
        audience: env.JWT_AUDIENCE,
      });

      if (typeof decoded === "string") {
        throw new InvalidAccessTokenError();
      }

      const payload = accessTokenPayloadSchema.parse({
        sub: decoded.sub,
        email: decoded.email,
      });

      return {
        userId: payload.sub,
        email: payload.email,
      };
    } catch {
      throw new InvalidAccessTokenError();
    }
  }
}
