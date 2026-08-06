import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

console.log('🔵 Supabase URL:', supabaseUrl);
console.log('🔵 Supabase Key:', supabaseAnonKey ? '✅ Present' : '❌ Missing');

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('🔴 Missing Supabase environment variables!');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Test connection
supabase.from('profiles').select('count', { count: 'exact', head: true })
  .then(({ data, error }) => {
    if (error) {
      console.error('🔴 Supabase connection test FAILED:', error.message);
    } else {
      console.log('✅ Supabase connection test PASSED');
    }
  });