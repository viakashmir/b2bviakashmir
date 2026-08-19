import { NextResponse } from 'next/server'
import { serverSupabase } from '@/lib/supabase'
import { rowToHotel, isExpired } from '@/lib/data'

export const dynamic = 'force-dynamic'

/**
 * GET /api/hotels, public listing of approved hotels with rooms.
 * Hotels whose tariff period has expired are approved but excluded here,
 * so a listing automatically drops off the public board the day after
 * its tariffEnd and reappears the moment tariffEnd is updated.
 */
export async function GET() {
  const sb = serverSupabase()
  const [{ data: hotels, error: hErr }, { data: rooms, error: rErr }] = await Promise.all([
    sb.from('hotels').select('*').eq('approved', true).order('created_at', { ascending: false }),
    sb.from('rooms').select('*'),
  ])
  if (hErr || rErr) return NextResponse.json({ error: hErr?.message || rErr?.message }, { status: 500 })
  const mapped = (hotels ?? [])
    .map((h: any) => rowToHotel(h, rooms ?? []))
    .filter(h => !isExpired(h))
  return NextResponse.json({ hotels: mapped })
}
