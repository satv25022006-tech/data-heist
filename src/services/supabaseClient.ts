import { createClient, SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL_KEY = 'detective_supabase_url';
const SUPABASE_KEY_KEY = 'detective_supabase_anon_key';

export function getStoredSupabaseConfig(): { url: string; anonKey: string } {
  const url = localStorage.getItem(SUPABASE_URL_KEY) || import.meta.env.VITE_SUPABASE_URL || '';
  const anonKey = localStorage.getItem(SUPABASE_KEY_KEY) || import.meta.env.VITE_SUPABASE_ANON_KEY || '';
  return { url, anonKey };
}

export function saveSupabaseConfig(url: string, anonKey: string): void {
  localStorage.setItem(SUPABASE_URL_KEY, url.trim());
  localStorage.setItem(SUPABASE_KEY_KEY, anonKey.trim());
}

let cachedClient: SupabaseClient | null = null;
let cachedConfigUrl = '';

export function getSupabaseClient(): SupabaseClient | null {
  const { url, anonKey } = getStoredSupabaseConfig();
  if (!url || !anonKey) {
    return null;
  }
  if (cachedClient && cachedConfigUrl === url) {
    return cachedClient;
  }
  try {
    cachedClient = createClient(url, anonKey);
    cachedConfigUrl = url;
    return cachedClient;
  } catch (err) {
    console.error('Failed to initialize Supabase client:', err);
    return null;
  }
}

export async function testSupabaseConnection(): Promise<{ success: boolean; message: string }> {
  const client = getSupabaseClient();
  if (!client) {
    return { success: false, message: 'Supabase URL and Anon Key are not configured.' };
  }
  try {
    // Try a light query on profiles or game_settings or a simple ping
    const { data, error } = await client.from('game_settings').select('*').limit(1);
    if (error) {
      // If table doesn't exist yet, check if connection itself works
      if (error.code === '42P01') {
        return { success: true, message: 'Connected successfully to Supabase! (Note: tables need to be created via schema.sql).' };
      }
      return { success: false, message: `Supabase connection error: ${error.message}` };
    }
    return { success: true, message: 'Successfully connected to Supabase and verified database tables!' };
  } catch (err: any) {
    return { success: false, message: `Connection test failed: ${err.message || err}` };
  }
}
