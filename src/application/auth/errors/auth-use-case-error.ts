import { AppError } from "../../../errors/app-error.js";

export class AuthUseCaseError extends AppError {
  constructor(
    code: "EMAIL_ALREADY_EXISTS" | "INVALID_CREDENTIALS",
    message?: string,
  ) {
    super(code, message);
  }
}
