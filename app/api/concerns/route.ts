import { NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'
import { serverSupabase } from '@/lib/supabase'
import { rowToConcern } from '@/lib/data'

export const dynamic = 'force-dynamic'

/**
 * GET /api/concerns
 *   - admin → returns ALL concerns
 *   - customer → returns only concerns raised by them (matched by email)
 *   - everyone else → 403
 */
export async function GET() {
  const { userId, sessionClaims } = await auth()
  if (!userId) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 })
  const role = (sessionClaims?.metadata as { role?: string } | undefined)?.role

  const sb = serverSupabase()
  if (role === 'admin') {
    const { data, error } = await sb.from('concerns').select('*').order('updated_at', { ascending: false })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ concerns: (data ?? []).map(rowToConcern) })
  }
  if (role === 'customer' || !role) {
    const user = await currentUser()
    const email = user?.primaryEmailAddress?.emailAddress?.toLowerCase() ?? ''
    if (!email) return NextResponse.json({ concerns: [] })
    const { data, error } = await sb.from('concerns')
      .select('*').eq('agent_email', email).order('updated_at', { ascending: false })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ concerns: (data ?? []).map(rowToConcern) })
  }
  return NextResponse.json({ error: 'forbidden' }, { status: 403 })
}

/** POST /api/concerns — customer raises a concern. */
export async function POST(req: Request) {
  const { userId, sessionClaims } = await auth()
  if (!userId) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 })
  const role = (sessionClaims?.metadata as { role?: string } | undefined)?.role
  if (role && role !== 'customer') return NextResponse.json({ error: 'forbidden' }, { status: 403 })

  const user = await currentUser()
  const body = await req.json()
  const sb = serverSupabase()
  const id = 'con_' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36)

  const { error } = await sb.from('concerns').insert({
    id,
    hotel_id: String(body.hotelId ?? ''),
    hotel_name: String(body.hotelName ?? ''),
    agent_name: user?.fullName || user?.firstName || user?.username || 'Travel Agent',
    agent_email: user?.primaryEmailAddress?.emailAddress?.toLowerCase() ?? '',
    agent_company: String(body.company ?? '').trim(),
    category: String(body.category ?? 'Other'),
    subject: String(body.subject ?? '').trim(),
    description: String(body.description ?? '').trim(),
    status: 'open',
    priority: String(body.priority ?? 'medium'),
    admin_response: '',
    admin_response_at: null,
  })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true, id })
}
