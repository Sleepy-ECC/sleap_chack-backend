import { createApp } from "../app.js";
import { createAuthModule } from "../infrastructure/di/auth-module.js";
import { createSleepRecordModule } from "../infrastructure/di/sleep-record-module.js";
import { createSleepMethodModule } from "../infrastructure/di/sleep-method-module.js";
import { createVoicevoxModule } from "../infrastructure/di/voicevox-module.js";

export const bootstrapApp = () => {
  // Composition Root: 起動時に一度だけ具象実装を束ねてアプリへ渡す
  const authModule = createAuthModule();
  const sleepRecordModule = createSleepRecordModule();
  const sleepMethodModule = createSleepMethodModule();
  const voicevoxModule = createVoicevoxModule();
  return createApp({ authModule, sleepRecordModule, sleepMethodModule, voicevoxModule });
};
