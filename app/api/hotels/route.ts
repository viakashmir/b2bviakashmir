import { NextResponse } from 'next/server'
import { serverSupabase } from '@/lib/supabase'
import { rowToHotel } from '@/lib/data'

export const dynamic = 'force-dynamic'

/** GET /api/hotels — public listing of approved hotels with rooms. */
export async function GET() {
  const sb = serverSupabase()
  const [{ data: hotels, error: hErr }, { data: rooms, error: rErr }] = await Promise.all([
    sb.from('hotels').select('*').eq('approved', true).order('created_at', { ascending: false }),
    sb.from('rooms').select('*'),
  ])
  if (hErr || rErr) return NextResponse.json({ error: hErr?.message || rErr?.message }, { status: 500 })
  const mapped = (hotels ?? []).map(h => rowToHotel(h, rooms ?? []))
  return NextResponse.json({ hotels: mapped })
}
