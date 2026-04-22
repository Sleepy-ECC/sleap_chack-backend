import { AppError } from "../../../errors/app-error.js";

export class VoicevoxUseCaseError extends AppError {
  constructor(
    code: "VOICEVOX_REQUEST_FAILED",
    message?: string,
  ) {
    super(code, message);
  }
}
