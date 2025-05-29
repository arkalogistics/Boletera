// lib/supabaseClient.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://snwjyhnsbouyjubbnhdj.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNud2p5aG5zYm91eWp1YmJuaGRqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgzOTc2NzIsImV4cCI6MjA2Mzk3MzY3Mn0.Fv5rcougqFeu8qHWzApYm6nOBhHH4GoLxFQNgDJU5LQ";

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Env vars NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be set'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
