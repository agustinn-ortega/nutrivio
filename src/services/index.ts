export {
  analyzeText,
  analyzeImage,
  setGoogleAIKey,
  getGoogleAIKey,
  isAIConfigured,
} from './ai';
export type { AIFoodResult } from './ai';

export {
  fetchEntries,
  createEntry,
  updateEntry,
  deleteEntry,
  fetchProfile,
  updateProfile,
  fetchWeightEntries,
  createWeightEntry,
  deleteWeightEntry,
  updateWeightGoal,
  fetchWeightGoal,
  fetchWaterLog,
  upsertWaterLog,
  fetchReminders,
  updateReminder,
} from './db';
export type {
  Entry,
  NewEntry,
  Profile,
  WeightEntry,
  WaterLog,
  Reminder,
} from './db';
