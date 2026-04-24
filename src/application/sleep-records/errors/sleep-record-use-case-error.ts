import { AppError } from "../../../errors/app-error.js";

export class SleepRecordUseCaseError extends AppError {
  constructor(
    code: "INVALID_SLEEP_RECORD_REFERENCE",
    message?: string,
  ) {
    super(code, message);
  }
}
