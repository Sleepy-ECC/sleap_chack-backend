import { LoginUserInteractor, type LoginUserUseCase } from "../../application/auth/usecases/login-user.js";
import { RegisterUserInteractor, type RegisterUserUseCase } from "../../application/auth/usecases/register-user.js";
import { BcryptPasswordHasher } from "../auth/bcrypt-password-hasher.js";
import { DrizzleUserRepository } from "../auth/drizzle-user-repository.js";
import { JwtTokenIssuer } from "../auth/jwt-token-issuer.js";

export type AuthModule = {
  registerUserUseCase: RegisterUserUseCase;
  loginUserUseCase: LoginUserUseCase;
};

export type AuthDependencies = {
  registerUserUseCase: RegisterUserUseCase;
  loginUserUseCase: LoginUserUseCase;
};

export const createAuthDependencies = (): AuthDependencies => {
  const userRepository = new DrizzleUserRepository();
  const passwordHasher = new BcryptPasswordHasher();
  const tokenIssuer = new JwtTokenIssuer();

  return {
    registerUserUseCase: new RegisterUserInteractor(userRepository, passwordHasher, tokenIssuer),
    loginUserUseCase: new LoginUserInteractor(userRepository, passwordHasher, tokenIssuer),
  };
};
