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

  setSelectedDate: (date) => set({ selectedDate: date }),

  addEntry: (entry) =>
    set((s) => ({ entries: [...s.entries, { ...entry, id: uuid() }] })),

  updateEntry: (id, updates) =>
    set((s) => ({
      entries: s.entries.map((e) => (e.id === id ? { ...e, ...updates } : e)),
    })),

  deleteEntry: (id) =>
    set((s) => ({ entries: s.entries.filter((e) => e.id !== id) })),

  setGoals: (goals) =>
    set((s) => ({ goals: { ...s.goals, ...goals } })),

  addWeightEntry: (weight, date, time) =>
    set((s) => ({
      weightEntries: [
        ...s.weightEntries,
        { id: uuid(), weight, date, time },
      ],
      weightGoal: { ...s.weightGoal, current: weight },
    })),

  deleteWeightEntry: (id) =>
    set((s) => ({
      weightEntries: s.weightEntries.filter((e) => e.id !== id),
    })),

  setWeightGoal: (target) =>
    set((s) => ({ weightGoal: { ...s.weightGoal, target } })),

  toggleReminder: (id) =>
    set((s) => ({
      reminders: s.reminders.map((r) =>
        r.id === id ? { ...r, enabled: !r.enabled } : r
      ),
    })),

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

  addWater: (ml) =>
    set((s) => ({
      water: { ...s.water, currentMl: s.water.currentMl + ml },
    })),

  resetDailyWater: () =>
    set((s) => ({ water: { ...s.water, currentMl: 0 } })),

  updateSettings: (s) =>
    set((state) => ({ settings: { ...state.settings, ...s } })),

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
