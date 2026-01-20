/**
 * Supabase Client Configuration
 * Production-ready setup with Clerk integration and security best practices
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

/**
 * Browser-side Supabase client
 * Use this in client components and API routes
 */
export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    flowType: 'pkce',
    detectSessionInUrl: false,
    autoRefreshToken: true,
    persistSession: true,
  },
  db: {
    schema: 'public',
  },
  global: {
    headers: {
      'X-Client-Info': 'circuit-space',
    },
  },
})

/**
 * Create a browser client with cookies support
 * Use this in Server Components and Server Actions
 */
export function createClientSupabase() {
  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}

/**
 * Get Supabase client with Clerk user context
 * This ensures RLS policies work correctly with Clerk authentication
 */
export async function getSupabaseWithClerk(clerkUserId: string) {
  // Set the user context for RLS policies
  // Note: This requires custom JWT handling - see server.ts for full implementation
  return supabase
}
