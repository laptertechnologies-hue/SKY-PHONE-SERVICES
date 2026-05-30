import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string) || 'https://rucfqfwwulfsyxdckwjo.supabase.co';
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || 'sb_publishable_nxAnXNRf7bn-5MBT0GyEzA_AH8BgUqR';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
