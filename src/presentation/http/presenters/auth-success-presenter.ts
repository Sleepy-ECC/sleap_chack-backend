import type { User } from "../../../domain/auth/user.js";

type AuthSuccessPayload = {
  user: User;
  accessToken: string;
};

export const toAuthSuccessResponse = (payload: AuthSuccessPayload) => ({
  ok: true as const,
  user: {
    id: payload.user.id,
    email: payload.user.email.value,
    displayName: payload.user.displayName,
    createdAt: payload.user.createdAt.toISOString(),
  },
  accessToken: payload.accessToken,
});
