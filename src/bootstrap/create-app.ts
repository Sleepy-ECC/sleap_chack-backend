import { createApp } from "../app.js";
import { createAuthDependencies } from "../infrastructure/di/auth-module.js";
import { createSleepRecordDependencies } from "../infrastructure/di/sleep-record-module.js";
import { createSleepMethodDependencies } from "../infrastructure/di/sleep-method-module.js";
import { createVoicevoxDependencies } from "../infrastructure/di/voicevox-module.js";

export const bootstrapApp = () => {
  // Composition Root: 起動時に一度だけ具象実装を束ねてアプリへ渡す
  const authDependencies = createAuthDependencies();
  const sleepRecordDependencies = createSleepRecordDependencies();
  const sleepMethodDependencies = createSleepMethodDependencies();
  const voicevoxDependencies = createVoicevoxDependencies();

  return createApp({
    authDependencies,
    sleepRecordDependencies,
    sleepMethodDependencies,
    voicevoxDependencies,
  });
};
