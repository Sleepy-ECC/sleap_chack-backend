import { AuthUseCaseError } from "../../../application/auth/errors/auth-use-case-error.js";

export const toAuthErrorResponse = (error: unknown) => {
  if (!(error instanceof AuthUseCaseError)) {
    throw error;
  }

  if (error.code === "EMAIL_ALREADY_EXISTS") {
    return {
      status: 409 as const,
      body: {
        ok: false,
        error: error.code,
      },
    };
  }

  return {
    status: 401 as const,
    body: {
      ok: false,
      error: error.code,
    },
  };
};
