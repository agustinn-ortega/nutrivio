import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  FoodEntry,
  DailyGoals,
  WeightEntry,
  Reminder,
  WaterSettings,
  UserSettings,
} from '../types';
import { mockEntries, defaultReminders } from '../mock/data';
import { v4 as uuid } from 'uuid';
import { auth } from '../services/firebase';
import {
  fetchEntries,
  createEntry as dbCreateEntry,
  updateEntry as dbUpdateEntry,
  deleteEntry as dbDeleteEntry,
  fetchProfile,
  updateProfile,
  fetchWeightEntries,
  createWeightEntry as dbCreateWeightEntry,
  deleteWeightEntry as dbDeleteWeightEntry,
  updateWeightGoal as dbUpdateWeightGoal,
  fetchWeightGoal,
  fetchWaterLog,
  upsertWaterLog,
  fetchReminders,
  updateReminder as dbUpdateReminder,
} from '../services/db';

interface AppState {
  selectedDate: string;
  entries: FoodEntry[];
  goals: DailyGoals;
  weightEntries: WeightEntry[];
  weightGoal: { current: number | null; target: number | null };
  reminders: Reminder[];
  water: WaterSettings;
  settings: UserSettings;
  drawerOpen: boolean;
  hasHydrated: boolean;

  syncFromSupabase: () => Promise<void>;
  setSelectedDate: (date: string) => void;
  addEntry: (entry: Omit<FoodEntry, 'id'>) => void;
  updateEntry: (id: string, updates: Partial<FoodEntry>) => void;
  deleteEntry: (id: string) => void;
  setGoals: (goals: Partial<DailyGoals>) => void;
  addWeightEntry: (weight: number, date: string, time: string) => void;
  deleteWeightEntry: (id: string) => void;
  setWeightGoal: (target: number) => void;
  toggleReminder: (id: string) => void;
  updateReminderTime: (id: string, time: string) => void;
  setWaterEnabled: (enabled: boolean) => void;
  setWaterGoal: (ml: number) => void;
  addWater: (ml: number) => void;
  resetDailyWater: () => void;
  updateSettings: (s: Partial<UserSettings>) => void;
  setDrawerOpen: (open: boolean) => void;

  getEntriesForDate: (date: string) => FoodEntry[];
  getDayTotals: (date: string) => {
    foodCalories: number;
    exerciseCalories: number;
    remaining: number;
    macros: { carbs: number; protein: number; fat: number };
  };
}

const todayStr = new Date().toISOString().split('T')[0];

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
  selectedDate: todayStr,
  entries: mockEntries,
  goals: {
    calories: 2000,
    carbsPercent: 50,
    proteinPercent: 25,
    fatPercent: 25,
  },
  weightEntries: [],
  weightGoal: { current: null, target: null },
  reminders: defaultReminders,
  water: { enabled: false, dailyGoalMl: 2500, currentMl: 0 },
  settings: {
    liquidUnit: 'L',
    weightUnit: 'kg',
    firstDayOfWeek: 'Monday',
    isPremium: false,
  },
  drawerOpen: false,
  hasHydrated: false,

  // -----------------------------------------------------------------
  // Supabase sync: fetch remote data and merge into local state
  // -----------------------------------------------------------------
  syncFromSupabase: async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        set({ hasHydrated: true });
        return;
      }

      const date = get().selectedDate;

      const [
        remoteEntries,
        profile,
        weightEntries,
        weightGoalTarget,
        waterLog,
        reminders,
      ] = await Promise.all([
        fetchEntries(date),
        fetchProfile(),
        fetchWeightEntries(),
        fetchWeightGoal(),
        fetchWaterLog(date),
        fetchReminders(),
      ]);

      // Map DB entries -> local FoodEntry shape
      const mappedEntries: FoodEntry[] = remoteEntries.map((e) => ({
        id: e.id,
        title: e.title,
        description: e.description ?? '',
        amount: e.amount ?? '',
        calories: e.calories,
        macros: { carbs: e.carbs, protein: e.protein, fat: e.fat },
        time: e.entry_time ?? '',
        date: e.entry_date,
        type: e.entry_type,
        healthAnalysis: e.health_analysis ?? undefined,
        nutritionDetail: e.nutrition_detail as unknown as FoodEntry['nutritionDetail'],
      }));

      // Map DB weight entries -> local WeightEntry shape
      const mappedWeight: WeightEntry[] = weightEntries.map((w) => ({
        id: w.id,
        weight: w.weight,
        date: w.entry_date,
        time: w.entry_time ?? '',
      }));

      // Map DB reminders -> local Reminder shape
      const mappedReminders: Reminder[] = reminders.map((r) => ({
        id: r.id,
        label: r.label,
        time: r.reminder_time,
        enabled: r.enabled,
      }));

      const currentWeight =
        mappedWeight.length > 0 ? mappedWeight[0].weight : get().weightGoal.current;

      const updates: Partial<AppState> = {
        entries: mappedEntries,
        weightEntries: mappedWeight,
        weightGoal: {
          current: currentWeight,
          target: weightGoalTarget ?? get().weightGoal.target,
        },
        hasHydrated: true,
      };

      if (reminders.length > 0) {
        updates.reminders = mappedReminders;
      }

      if (waterLog) {
        updates.water = {
          ...get().water,
          currentMl: waterLog.amount_ml,
          dailyGoalMl: waterLog.goal_ml,
        };
      }

      if (profile) {
        updates.goals = {
          calories: profile.daily_calories ?? get().goals.calories,
          carbsPercent: profile.carbs_percent ?? get().goals.carbsPercent,
          proteinPercent: profile.protein_percent ?? get().goals.proteinPercent,
          fatPercent: profile.fat_percent ?? get().goals.fatPercent,
        };
        updates.settings = {
          liquidUnit: (profile.liquid_unit as UserSettings['liquidUnit']) ?? get().settings.liquidUnit,
          weightUnit: (profile.weight_unit as UserSettings['weightUnit']) ?? get().settings.weightUnit,
          firstDayOfWeek: (profile.first_day_of_week as UserSettings['firstDayOfWeek']) ?? get().settings.firstDayOfWeek,
          isPremium: profile.is_premium ?? get().settings.isPremium,
        };
      }

      set(updates);
    } catch (err) {
      console.warn('[store] syncFromSupabase failed:', err);
      set({ hasHydrated: true });
    }
  },

  setSelectedDate: (date) => set({ selectedDate: date }),

  addEntry: (entry) => {
    const id = uuid();
    set((s) => ({ entries: [...s.entries, { ...entry, id }] }));
    // Sync to Supabase in background
    dbCreateEntry({
      title: entry.title,
      description: entry.description || null,
      amount: entry.amount || null,
      calories: entry.calories,
      carbs: entry.macros.carbs,
      protein: entry.macros.protein,
      fat: entry.macros.fat,
      entry_type: entry.type,
      entry_date: entry.date,
      entry_time: entry.time || null,
      health_analysis: entry.healthAnalysis ?? null,
      nutrition_detail: (entry.nutritionDetail as unknown as Record<string, unknown>) ?? null,
    }).catch(console.warn);
  },

  updateEntry: (id, updates) => {
    set((s) => ({
      entries: s.entries.map((e) => (e.id === id ? { ...e, ...updates } : e)),
    }));
    // Sync to Supabase in background
    const dbUpdates: Record<string, unknown> = {};
    if (updates.title !== undefined) dbUpdates.title = updates.title;
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    if (updates.amount !== undefined) dbUpdates.amount = updates.amount;
    if (updates.calories !== undefined) dbUpdates.calories = updates.calories;
    if (updates.macros !== undefined) {
      dbUpdates.carbs = updates.macros.carbs;
      dbUpdates.protein = updates.macros.protein;
      dbUpdates.fat = updates.macros.fat;
    }
    if (updates.type !== undefined) dbUpdates.entry_type = updates.type;
    if (updates.date !== undefined) dbUpdates.entry_date = updates.date;
    if (updates.time !== undefined) dbUpdates.entry_time = updates.time;
    if (updates.healthAnalysis !== undefined) dbUpdates.health_analysis = updates.healthAnalysis;
    if (updates.nutritionDetail !== undefined) dbUpdates.nutrition_detail = updates.nutritionDetail;
    if (Object.keys(dbUpdates).length > 0) {
      dbUpdateEntry(id, dbUpdates as any).catch(console.warn);
    }
  },

  deleteEntry: (id) => {
    set((s) => ({ entries: s.entries.filter((e) => e.id !== id) }));
    // Sync to Supabase in background
    dbDeleteEntry(id).catch(console.warn);
  },

  setGoals: (goals) => {
    set((s) => ({ goals: { ...s.goals, ...goals } }));
    // Sync to Supabase in background
    const profileUpdates: Record<string, unknown> = {};
    if (goals.calories !== undefined) profileUpdates.daily_calories = goals.calories;
    if (goals.carbsPercent !== undefined) profileUpdates.carbs_percent = goals.carbsPercent;
    if (goals.proteinPercent !== undefined) profileUpdates.protein_percent = goals.proteinPercent;
    if (goals.fatPercent !== undefined) profileUpdates.fat_percent = goals.fatPercent;
    if (Object.keys(profileUpdates).length > 0) {
      updateProfile(profileUpdates as any).catch(console.warn);
    }
  },

  addWeightEntry: (weight, date, time) => {
    const id = uuid();
    set((s) => ({
      weightEntries: [
        ...s.weightEntries,
        { id, weight, date, time },
      ],
      weightGoal: { ...s.weightGoal, current: weight },
    }));
    // Sync to Supabase in background
    dbCreateWeightEntry(weight, date, time).catch(console.warn);
  },

  deleteWeightEntry: (id) => {
    set((s) => ({
      weightEntries: s.weightEntries.filter((e) => e.id !== id),
    }));
    // Sync to Supabase in background
    dbDeleteWeightEntry(id).catch(console.warn);
  },

  setWeightGoal: (target) => {
    set((s) => ({ weightGoal: { ...s.weightGoal, target } }));
    // Sync to Supabase in background
    dbUpdateWeightGoal(target).catch(console.warn);
  },

  toggleReminder: (id) => {
    const reminder = get().reminders.find((r) => r.id === id);
    const newEnabled = reminder ? !reminder.enabled : true;
    set((s) => ({
      reminders: s.reminders.map((r) =>
        r.id === id ? { ...r, enabled: !r.enabled } : r
      ),
    }));
    // Sync to Supabase in background
    dbUpdateReminder(id, { enabled: newEnabled }).catch(console.warn);
  },

  updateReminderTime: (id, time) =>
    set((s) => ({
      reminders: s.reminders.map((r) =>
        r.id === id ? { ...r, time } : r
      ),
    })),

  setWaterEnabled: (enabled) =>
    set((s) => ({ water: { ...s.water, enabled } })),

  setWaterGoal: (ml) =>
    set((s) => ({ water: { ...s.water, dailyGoalMl: ml } })),

  addWater: (ml) => {
    const state = get();
    const newMl = state.water.currentMl + ml;
    set((s) => ({
      water: { ...s.water, currentMl: newMl },
    }));
    // Sync to Supabase in background
    upsertWaterLog(
      state.selectedDate,
      newMl,
      state.water.dailyGoalMl,
    ).catch(console.warn);
  },

  resetDailyWater: () =>
    set((s) => ({ water: { ...s.water, currentMl: 0 } })),

  updateSettings: (s) => {
    set((state) => ({ settings: { ...state.settings, ...s } }));
    // Sync to Supabase in background
    const profileUpdates: Record<string, unknown> = {};
    if (s.liquidUnit !== undefined) profileUpdates.liquid_unit = s.liquidUnit;
    if (s.weightUnit !== undefined) profileUpdates.weight_unit = s.weightUnit;
    if (s.firstDayOfWeek !== undefined) profileUpdates.first_day_of_week = s.firstDayOfWeek;
    if (s.isPremium !== undefined) profileUpdates.is_premium = s.isPremium;
    if (Object.keys(profileUpdates).length > 0) {
      updateProfile(profileUpdates as any).catch(console.warn);
    }
  },

  setDrawerOpen: (open) => set({ drawerOpen: open }),

  getEntriesForDate: (date) => get().entries.filter((e) => e.date === date),

  getDayTotals: (date) => {
    const entries = get().entries.filter((e) => e.date === date);
    const goals = get().goals;
    const foodCalories = entries
      .filter((e) => e.type === 'food')
      .reduce((sum, e) => sum + e.calories, 0);
    const exerciseCalories = entries
      .filter((e) => e.type === 'exercise')
      .reduce((sum, e) => sum + e.calories, 0);
    const macros = entries
      .filter((e) => e.type === 'food')
      .reduce(
        (acc, e) => ({
          carbs: acc.carbs + e.macros.carbs,
          protein: acc.protein + e.macros.protein,
          fat: acc.fat + e.macros.fat,
        }),
        { carbs: 0, protein: 0, fat: 0 }
      );
    return {
      foodCalories,
      exerciseCalories,
      remaining: goals.calories - foodCalories + exerciseCalories,
      macros,
    };
  },
    }),
    {
      name: 'nutrivio-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        entries: state.entries,
        goals: state.goals,
        weightEntries: state.weightEntries,
        weightGoal: state.weightGoal,
        reminders: state.reminders,
        water: state.water,
        settings: state.settings,
      }),
    }
  )
);
