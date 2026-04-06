import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import { db, auth } from './firebase';

// ---------------------------------------------------------------------------
// Local interfaces (same shape as before)
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
  const user = auth.currentUser;
  if (!user) throw new Error('No authenticated user');
  return user.uid;
}

async function getUserIdAsync(): Promise<string> {
  return getUserId();
}

// ---------------------------------------------------------------------------
// Entries
// ---------------------------------------------------------------------------

export async function fetchEntries(date: string): Promise<Entry[]> {
  try {
    const userId = getUserId();
    const q = query(
      collection(db, 'entries'),
      where('user_id', '==', userId),
      where('entry_date', '==', date),
      orderBy('entry_time', 'asc')
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Entry));
  } catch (err) {
    console.error('[db] fetchEntries failed:', err);
    throw err;
  }
}

export async function createEntry(entry: NewEntry): Promise<Entry> {
  try {
    const userId = getUserId();
    const docRef = await addDoc(collection(db, 'entries'), {
      ...entry,
      user_id: userId,
    });
    return { id: docRef.id, user_id: userId, ...entry };
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
    await updateDoc(doc(db, 'entries', id), updates as Record<string, unknown>);
  } catch (err) {
    console.error('[db] updateEntry failed:', err);
    throw err;
  }
}

export async function deleteEntry(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'entries', id));
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
    const userId = getUserId();
    const snap = await getDoc(doc(db, 'profiles', userId));
    if (!snap.exists()) return null;
    return { id: snap.id, ...snap.data() } as Profile;
  } catch (err) {
    console.error('[db] fetchProfile failed:', err);
    throw err;
  }
}

export async function updateProfile(
  updates: Partial<Profile>,
): Promise<void> {
  try {
    const userId = getUserId();
    await setDoc(doc(db, 'profiles', userId), updates, { merge: true });
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
    const userId = getUserId();
    const q = query(
      collection(db, 'weight_entries'),
      where('user_id', '==', userId),
      orderBy('entry_date', 'desc')
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as WeightEntry));
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
    const userId = getUserId();
    const data = { user_id: userId, weight, entry_date: date, entry_time: time };
    const docRef = await addDoc(collection(db, 'weight_entries'), data);
    return { id: docRef.id, ...data };
  } catch (err) {
    console.error('[db] createWeightEntry failed:', err);
    throw err;
  }
}

export async function deleteWeightEntry(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'weight_entries', id));
  } catch (err) {
    console.error('[db] deleteWeightEntry failed:', err);
    throw err;
  }
}

export async function updateWeightGoal(target: number): Promise<void> {
  try {
    const userId = getUserId();
    await setDoc(doc(db, 'weight_goals', userId), { user_id: userId, target_weight: target }, { merge: true });
  } catch (err) {
    console.error('[db] updateWeightGoal failed:', err);
    throw err;
  }
}

export async function fetchWeightGoal(): Promise<number | null> {
  try {
    const userId = getUserId();
    const snap = await getDoc(doc(db, 'weight_goals', userId));
    if (!snap.exists()) return null;
    return (snap.data() as { target_weight: number }).target_weight;
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
    const userId = getUserId();
    const docId = `${userId}_${date}`;
    const snap = await getDoc(doc(db, 'water_logs', docId));
    if (!snap.exists()) return null;
    return { id: snap.id, ...snap.data() } as WaterLog;
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
    const userId = getUserId();
    const docId = `${userId}_${date}`;
    await setDoc(doc(db, 'water_logs', docId), {
      user_id: userId,
      log_date: date,
      amount_ml: amountMl,
      goal_ml: goalMl,
    }, { merge: true });
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
    const userId = getUserId();
    const q = query(
      collection(db, 'reminders'),
      where('user_id', '==', userId),
      orderBy('reminder_time', 'asc')
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Reminder));
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
    await updateDoc(doc(db, 'reminders', id), updates as Record<string, unknown>);
  } catch (err) {
    console.error('[db] updateReminder failed:', err);
    throw err;
  }
}
