import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

/**
 * Browser-side client. Public reads only — RLS allows `select` on
 * approved hotels and their rooms. Use this for the public board and
 * real-time subscriptions.
 */
export function browserSupabase(): SupabaseClient {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY missing')
  }
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false },
    realtime: { params: { eventsPerSecond: 10 } },
  })
}

/**
 * Server-only client with the service-role key — bypasses RLS. Use this
 * inside API routes for writes and authorised reads (after Clerk auth).
 * NEVER import this from a client component.
 */
export function serverSupabase(): SupabaseClient {
  const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!SUPABASE_URL || !SERVICE_ROLE) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY missing')
  }
  return createClient(SUPABASE_URL, SERVICE_ROLE, { auth: { persistSession: false } })
}
