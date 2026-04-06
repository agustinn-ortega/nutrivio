-- =============================================
-- Nutrivio Database Schema
-- Run this in Supabase SQL Editor
-- =============================================

-- Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  weight_unit TEXT DEFAULT 'kg' CHECK (weight_unit IN ('kg', 'lb')),
  liquid_unit TEXT DEFAULT 'L' CHECK (liquid_unit IN ('L', 'oz')),
  first_day_of_week TEXT DEFAULT 'Monday' CHECK (first_day_of_week IN ('Monday', 'Sunday')),
  is_premium BOOLEAN DEFAULT false,
  daily_calories INTEGER DEFAULT 2000,
  carbs_percent INTEGER DEFAULT 50,
  protein_percent INTEGER DEFAULT 25,
  fat_percent INTEGER DEFAULT 25,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Food/exercise entries
CREATE TABLE IF NOT EXISTS public.entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  amount TEXT,
  calories INTEGER DEFAULT 0,
  carbs REAL DEFAULT 0,
  protein REAL DEFAULT 0,
  fat REAL DEFAULT 0,
  entry_type TEXT DEFAULT 'food' CHECK (entry_type IN ('food', 'exercise')),
  entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
  entry_time TIME NOT NULL DEFAULT CURRENT_TIME,
  health_analysis TEXT,
  nutrition_detail JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Weight entries
CREATE TABLE IF NOT EXISTS public.weight_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  weight REAL NOT NULL,
  entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
  entry_time TIME NOT NULL DEFAULT CURRENT_TIME,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Weight goals
CREATE TABLE IF NOT EXISTS public.weight_goals (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  target_weight REAL,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Water tracking (daily)
CREATE TABLE IF NOT EXISTS public.water_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  log_date DATE NOT NULL DEFAULT CURRENT_DATE,
  amount_ml INTEGER DEFAULT 0,
  goal_ml INTEGER DEFAULT 2500,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, log_date)
);

-- Reminders
CREATE TABLE IF NOT EXISTS public.reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  reminder_time TIME NOT NULL,
  enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- Row Level Security
-- =============================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weight_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weight_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.water_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;

-- Profiles
CREATE POLICY "Users read own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Entries
CREATE POLICY "Users read own entries" ON public.entries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own entries" ON public.entries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own entries" ON public.entries FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own entries" ON public.entries FOR DELETE USING (auth.uid() = user_id);

-- Weight
CREATE POLICY "Users read own weight" ON public.weight_entries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own weight" ON public.weight_entries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own weight" ON public.weight_entries FOR DELETE USING (auth.uid() = user_id);

-- Weight goals
CREATE POLICY "Users read own weight goal" ON public.weight_goals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users upsert own weight goal" ON public.weight_goals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own weight goal" ON public.weight_goals FOR UPDATE USING (auth.uid() = user_id);

-- Water
CREATE POLICY "Users read own water" ON public.water_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own water" ON public.water_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own water" ON public.water_logs FOR UPDATE USING (auth.uid() = user_id);

-- Reminders
CREATE POLICY "Users read own reminders" ON public.reminders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own reminders" ON public.reminders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own reminders" ON public.reminders FOR UPDATE USING (auth.uid() = user_id);

-- =============================================
-- Auto-create profile on signup
-- =============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email));

  INSERT INTO public.reminders (user_id, label, reminder_time, enabled) VALUES
    (NEW.id, 'Manana', '09:00', false),
    (NEW.id, 'Tarde', '13:00', false),
    (NEW.id, 'Noche', '19:00', false);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- Indexes
-- =============================================
CREATE INDEX IF NOT EXISTS idx_entries_user_date ON public.entries(user_id, entry_date);
CREATE INDEX IF NOT EXISTS idx_weight_user_date ON public.weight_entries(user_id, entry_date);
CREATE INDEX IF NOT EXISTS idx_water_user_date ON public.water_logs(user_id, log_date);
