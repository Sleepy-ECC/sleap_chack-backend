export interface TokenIssuer {
  issueAccessToken(payload: { sub: string; email: string }): string;
}
