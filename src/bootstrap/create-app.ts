import { createApp } from "../app.js";
import { createAuthModule } from "../infrastructure/di/auth-module.js";

export const bootstrapApp = () => {
  // Composition Root: 起動時に一度だけ具象実装を束ねてアプリへ渡す
  const authModule = createAuthModule();
  return createApp({ authModule });
};
