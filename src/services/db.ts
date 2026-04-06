import { supabase } from './supabase';

// ---------------------------------------------------------------------------
// Local interfaces (match DB schema)
// ---------------------------------------------------------------------------

export interface Entry {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  amount: string | null;
  calories: number;
  carbs: number;
  protein: number;
  fat: number;
  entry_type: 'food' | 'exercise';
  entry_date: string;
  entry_time: string | null;
  health_analysis: string | null;
  nutrition_detail: Record<string, unknown> | null;
}

export type NewEntry = Omit<Entry, 'id' | 'user_id'>;

export interface Profile {
  id: string;
  display_name: string | null;
  weight_unit: string | null;
  liquid_unit: string | null;
  first_day_of_week: string | null;
  is_premium: boolean;
  daily_calories: number | null;
  carbs_percent: number | null;
  protein_percent: number | null;
  fat_percent: number | null;
}

export interface WeightEntry {
  id: string;
  user_id: string;
  weight: number;
  entry_date: string;
  entry_time: string | null;
}

export interface WaterLog {
  id: string;
  user_id: string;
  log_date: string;
  amount_ml: number;
  goal_ml: number;
}

export interface Reminder {
  id: string;
  user_id: string;
  label: string;
  reminder_time: string;
  enabled: boolean;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getUserId(): string {
  // supabase.auth.getUser() is async; we rely on the session which is
  // synchronously available after login via getSession().
  const session = (supabase.auth as any).session;
  if (session?.user?.id) return session.user.id;
  throw new Error('No authenticated user');
}

async function getUserIdAsync(): Promise<string> {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) throw new Error('No authenticated user');
  return data.user.id;
}

// ---------------------------------------------------------------------------
// Entries
// ---------------------------------------------------------------------------

export async function fetchEntries(date: string): Promise<Entry[]> {
  try {
    const { data, error } = await supabase
      .from('entries')
      .select('*')
      .eq('entry_date', date)
      .order('entry_time', { ascending: true });

    if (error) throw error;
    return (data ?? []) as Entry[];
  } catch (err) {
    console.error('[db] fetchEntries failed:', err);
    throw err;
  }
}

export async function createEntry(entry: NewEntry): Promise<Entry> {
  try {
    const userId = await getUserIdAsync();
    const { data, error } = await supabase
      .from('entries')
      .insert({ ...entry, user_id: userId })
      .select()
      .single();

    if (error) throw error;
    return data as Entry;
  } catch (err) {
    console.error('[db] createEntry failed:', err);
    throw err;
  }
}

export async function updateEntry(
  id: string,
  updates: Partial<Entry>,
): Promise<void> {
  try {
    const { error } = await supabase
      .from('entries')
      .update(updates)
      .eq('id', id);

    if (error) throw error;
  } catch (err) {
    console.error('[db] updateEntry failed:', err);
    throw err;
  }
}

export async function deleteEntry(id: string): Promise<void> {
  try {
    const { error } = await supabase.from('entries').delete().eq('id', id);

    if (error) throw error;
  } catch (err) {
    console.error('[db] deleteEntry failed:', err);
    throw err;
  }
}

// ---------------------------------------------------------------------------
// Profile / Goals
// ---------------------------------------------------------------------------

export async function fetchProfile(): Promise<Profile | null> {
  try {
    const userId = await getUserIdAsync();
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error && error.code === 'PGRST116') return null; // no rows
    if (error) throw error;
    return data as Profile;
  } catch (err) {
    console.error('[db] fetchProfile failed:', err);
    throw err;
  }
}

export async function updateProfile(
  updates: Partial<Profile>,
): Promise<void> {
  try {
    const userId = await getUserIdAsync();
    const { error } = await supabase
      .from('profiles')
      .upsert({ id: userId, ...updates })
      .eq('id', userId);

    if (error) throw error;
  } catch (err) {
    console.error('[db] updateProfile failed:', err);
    throw err;
  }
}

// ---------------------------------------------------------------------------
// Weight
// ---------------------------------------------------------------------------

export async function fetchWeightEntries(): Promise<WeightEntry[]> {
  try {
    const { data, error } = await supabase
      .from('weight_entries')
      .select('*')
      .order('entry_date', { ascending: false });

    if (error) throw error;
    return (data ?? []) as WeightEntry[];
  } catch (err) {
    console.error('[db] fetchWeightEntries failed:', err);
    throw err;
  }
}

export async function createWeightEntry(
  weight: number,
  date: string,
  time: string,
): Promise<WeightEntry> {
  try {
    const userId = await getUserIdAsync();
    const { data, error } = await supabase
      .from('weight_entries')
      .insert({ user_id: userId, weight, entry_date: date, entry_time: time })
      .select()
      .single();

    if (error) throw error;
    return data as WeightEntry;
  } catch (err) {
    console.error('[db] createWeightEntry failed:', err);
    throw err;
  }
}

export async function deleteWeightEntry(id: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('weight_entries')
      .delete()
      .eq('id', id);

    if (error) throw error;
  } catch (err) {
    console.error('[db] deleteWeightEntry failed:', err);
    throw err;
  }
}

export async function updateWeightGoal(target: number): Promise<void> {
  try {
    const userId = await getUserIdAsync();
    const { error } = await supabase
      .from('weight_goals')
      .upsert({ user_id: userId, target_weight: target });

    if (error) throw error;
  } catch (err) {
    console.error('[db] updateWeightGoal failed:', err);
    throw err;
  }
}

export async function fetchWeightGoal(): Promise<number | null> {
  try {
    const userId = await getUserIdAsync();
    const { data, error } = await supabase
      .from('weight_goals')
      .select('target_weight')
      .eq('user_id', userId)
      .single();

    if (error && error.code === 'PGRST116') return null;
    if (error) throw error;
    return (data as { target_weight: number }).target_weight;
  } catch (err) {
    console.error('[db] fetchWeightGoal failed:', err);
    throw err;
  }
}

// ---------------------------------------------------------------------------
// Water
// ---------------------------------------------------------------------------

export async function fetchWaterLog(date: string): Promise<WaterLog | null> {
  try {
    const userId = await getUserIdAsync();
    const { data, error } = await supabase
      .from('water_logs')
      .select('*')
      .eq('user_id', userId)
      .eq('log_date', date)
      .single();

    if (error && error.code === 'PGRST116') return null;
    if (error) throw error;
    return data as WaterLog;
  } catch (err) {
    console.error('[db] fetchWaterLog failed:', err);
    throw err;
  }
}

export async function upsertWaterLog(
  date: string,
  amountMl: number,
  goalMl: number,
): Promise<void> {
  try {
    const userId = await getUserIdAsync();
    const { error } = await supabase.from('water_logs').upsert(
      {
        user_id: userId,
        log_date: date,
        amount_ml: amountMl,
        goal_ml: goalMl,
      },
      { onConflict: 'user_id,log_date' },
    );

    if (error) throw error;
  } catch (err) {
    console.error('[db] upsertWaterLog failed:', err);
    throw err;
  }
}

// ---------------------------------------------------------------------------
// Reminders
// ---------------------------------------------------------------------------

export async function fetchReminders(): Promise<Reminder[]> {
  try {
    const { data, error } = await supabase
      .from('reminders')
      .select('*')
      .order('reminder_time', { ascending: true });

    if (error) throw error;
    return (data ?? []) as Reminder[];
  } catch (err) {
    console.error('[db] fetchReminders failed:', err);
    throw err;
  }
}

export async function updateReminder(
  id: string,
  updates: { enabled?: boolean; reminder_time?: string },
): Promise<void> {
  try {
    const { error } = await supabase
      .from('reminders')
      .update(updates)
      .eq('id', id);

    if (error) throw error;
  } catch (err) {
    console.error('[db] updateReminder failed:', err);
    throw err;
  }
}
