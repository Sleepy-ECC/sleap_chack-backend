import { eq } from "drizzle-orm";

import { DuplicateUserEmailError, type CreateUserInput, type UserRepository } from "../../application/auth/repositories/user-repository.js";
import { db } from "../../db/client.js";
import { users } from "../../db/schema.js";
import { Email } from "../../domain/auth/email.js";
import type { User } from "../../domain/auth/user.js";

const userSelection = {
  id: users.id,
  email: users.email,
  passwordHash: users.passwordHash,
  displayName: users.displayName,
  createdAt: users.createdAt,
};

export class DrizzleUserRepository implements UserRepository {
  async findByEmail(email: Email): Promise<User | null> {
    const [user] = await db.select(userSelection).from(users).where(eq(users.email, email.value)).limit(1);
    return user
      ? {
          ...user,
          email: Email.create(user.email),
        }
      : null;
  }

  async create(input: CreateUserInput): Promise<User> {
    try {
      const [user] = await db
        .insert(users)
        .values({
          email: input.email.value,
          passwordHash: input.passwordHash,
          displayName: input.displayName,
        })
        .returning(userSelection);

      return {
        ...user,
        email: Email.create(user.email),
      };
    } catch (error) {
      const dbError = error as { code?: string };

      if (dbError.code === "23505") {
        // DB 固有のエラーは repository レベルの例外に丸めて上位へ渡す。
        throw new DuplicateUserEmailError();
      }

      throw error;
    }
  }
}
