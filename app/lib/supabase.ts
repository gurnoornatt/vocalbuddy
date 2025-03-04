import { createClient } from "@supabase/supabase-js"

// Log Supabase initialization
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  console.error('NEXT_PUBLIC_SUPABASE_URL is not defined in environment variables');
}

if (!supabaseAnonKey) {
  console.error('NEXT_PUBLIC_SUPABASE_ANON_KEY is not defined in environment variables');
}

// Create a single instance of the Supabase client
export const supabase = createClient(
  supabaseUrl!,
  supabaseAnonKey!,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
    global: {
      fetch: (...args) => {
        // Log all Supabase API requests in development
        if (process.env.NODE_ENV === 'development') {
          console.log(`Supabase fetch:`, args[0]);
        }
        return fetch(...args);
      },
    },
  }
);

// Log successful initialization
console.log(`Supabase client initialized with URL: ${supabaseUrl?.substring(0, 8)}...`); 
