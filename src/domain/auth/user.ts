import type { Email } from "./email.js";

export type User = {
  id: string;
  email: Email;
  passwordHash: string | null;
  displayName: string | null;
  createdAt: Date;
};
