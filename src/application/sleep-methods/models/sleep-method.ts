export type SleepMethod = {
  id: string;
  code: string;
  name: string;
  description: string | null;
  category: string | null;
  hasAudio: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};
