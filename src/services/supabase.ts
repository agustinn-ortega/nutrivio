import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SUPABASE_URL = 'https://hcxfxohvymcidvvdjjtz.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_OESjYb_jcSZ6s6quABhbQQ_TGmtXnEd';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: typeof window !== 'undefined',
  },
});

export { SUPABASE_URL };
