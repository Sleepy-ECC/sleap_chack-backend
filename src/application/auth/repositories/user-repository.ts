import type { Email } from "../../../domain/auth/email.js";
import type { User } from "../../../domain/auth/user.js";

export type CreateUserInput = {
  email: Email;
  passwordHash: string;
  displayName: string | null;
};

export interface UserRepository {
  findByEmail(email: Email): Promise<User | null>;
  create(input: CreateUserInput): Promise<User>;
}

export class DuplicateUserEmailError extends Error {
  constructor(message = "EMAIL_ALREADY_EXISTS") {
    super(message);
    this.name = "DuplicateUserEmailError";
  }
}
