/**
 * Supabase Server-Side Client
 * For use in Server Components, Server Actions, and API Routes
 */

import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

/**
 * Create Supabase client for Server Components
 * Automatically handles cookies and session management
 * Note: In Next.js 15, cookies() must be awaited
 */
export async function createServerSupabase() {
  const cookieStore = await cookies()

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
      set(name: string, value: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value, ...options })
        } catch (error) {
          // Handle cookie setting errors (e.g., in middleware)
          // This can happen in middleware context
        }
      },
      remove(name: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value: '', ...options })
        } catch (error) {
          // Handle cookie removal errors
          // This can happen in middleware context
        }
      },
    },
  })
}

/**
 * Create Supabase admin client (bypasses RLS)
 * Use ONLY in secure server-side contexts (API routes with auth checks)
 * NEVER expose this to the client
 */
export function createAdminSupabase() {
  if (!supabaseServiceKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is required for admin operations')
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

/**
 * Get Supabase client with Clerk user context
 * This function sets the user context for RLS policies
 */
export async function getSupabaseWithClerkUser(clerkUserId: string) {
  const supabase = await createServerSupabase()
  
  // Set custom header for Clerk user ID
  // Note: You'll need to configure Supabase to read this header in RLS policies
  // This is a placeholder - actual implementation depends on your auth setup
  return supabase
}
