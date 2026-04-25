import { LoginUserInteractor, type LoginUserUseCase } from "../../application/auth/usecases/login-user.js";
import { RegisterUserInteractor, type RegisterUserUseCase } from "../../application/auth/usecases/register-user.js";
import type { TokenVerifier } from "../../application/auth/services/token-verifier.js";
import { BcryptPasswordHasher } from "../auth/bcrypt-password-hasher.js";
import { DrizzleUserRepository } from "../auth/drizzle-user-repository.js";
import { JwtTokenIssuer } from "../auth/jwt-token-issuer.js";
import { JwtTokenVerifier } from "../auth/jwt-token-verifier.js";

export type AuthModule = {
  registerUserUseCase: RegisterUserUseCase;
  loginUserUseCase: LoginUserUseCase;
};

export type AuthDependencies = {
  registerUserUseCase: RegisterUserUseCase;
  loginUserUseCase: LoginUserUseCase;
  tokenVerifier: TokenVerifier;
};

export const createAuthDependencies = (): AuthDependencies => {
  const userRepository = new DrizzleUserRepository();
  const passwordHasher = new BcryptPasswordHasher();
  const tokenIssuer = new JwtTokenIssuer();
  const tokenVerifier = new JwtTokenVerifier();

  return {
    registerUserUseCase: new RegisterUserInteractor(userRepository, passwordHasher, tokenIssuer),
    loginUserUseCase: new LoginUserInteractor(userRepository, passwordHasher, tokenIssuer),
    tokenVerifier,
  };
};
