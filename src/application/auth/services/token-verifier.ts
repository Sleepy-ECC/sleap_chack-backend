export type AuthenticatedUser = {
  userId: string;
  email: string;
};

export class InvalidAccessTokenError extends Error {
  constructor(message = "INVALID_ACCESS_TOKEN") {
    super(message);
    this.name = "InvalidAccessTokenError";
  }
}

export interface TokenVerifier {
  verifyAccessToken(token: string): AuthenticatedUser;
}
