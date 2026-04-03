export interface Macros {
  carbs: number;
  protein: number;
  fat: number;
}

export interface NutritionDetail {
  totalCarbs: number;
  fiber: number;
  sugars: number;
  addedSugars: number;
  sugarAlcohols: number;
  netCarbs: number;
  protein: number;
  totalFat: number;
  saturatedFat: number;
  transFat: number;
  polyunsaturatedFat: number;
  monounsaturatedFat: number;
  cholesterol: number;
  sodium: number;
  calcium: number;
  iron: number;
  potassium: number;
  vitaminA: number;
  vitaminC: number;
  vitaminD: number;
}

export interface FoodEntry {
  id: string;
  title: string;
  description: string;
  amount: string;
  calories: number;
  macros: Macros;
  time: string;
  date: string;
  type: 'food' | 'exercise';
  healthAnalysis?: string;
  nutritionDetail?: NutritionDetail;
}

export interface DailyGoals {
  calories: number;
  carbsPercent: number;
  proteinPercent: number;
  fatPercent: number;
}

export interface WeightEntry {
  id: string;
  weight: number;
  date: string;
  time: string;
}

export interface WeightGoal {
  current: number | null;
  target: number | null;
}

export interface Reminder {
  id: string;
  label: string;
  time: string;
  enabled: boolean;
}

export interface WaterSettings {
  enabled: boolean;
  dailyGoalMl: number;
  currentMl: number;
}

export interface UserSettings {
  liquidUnit: 'L' | 'oz';
  weightUnit: 'kg' | 'lb';
  firstDayOfWeek: 'Monday' | 'Sunday';
  isPremium: boolean;
}

export interface DaySummary {
  date: string;
  calories: { food: number; exercise: number };
  macros: Macros;
}

export type DrawerRoute =
  | 'home'
  | 'goals'
  | 'weekly'
  | 'weight'
  | 'reminders'
  | 'water'
  | 'groups'
  | 'settings';
