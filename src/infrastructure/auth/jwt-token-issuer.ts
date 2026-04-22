import jwt from "jsonwebtoken";

import type { TokenIssuer } from "../../application/auth/services/token-issuer.js";
import { env } from "../../config/env.js";

export class JwtTokenIssuer implements TokenIssuer {
  issueAccessToken(payload: { sub: string; email: string }): string {
    return jwt.sign(
      {
        email: payload.email,
      },
      env.JWT_SECRET,
      {
        subject: payload.sub,
        issuer: env.JWT_ISSUER,
        audience: env.JWT_AUDIENCE,
        expiresIn: "7d",
      },
    );
  }
}
