import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { serverSupabase } from '@/lib/supabase'
import { rowToHotel } from '@/lib/data'

export const dynamic = 'force-dynamic'

async function assertAdmin() {
  const { userId, sessionClaims } = await auth()
  if (!userId) return { ok: false as const, code: 401 }
  const role = (sessionClaims?.metadata as { role?: string } | undefined)?.role
  if (role !== 'admin') return { ok: false as const, code: 403 }
  return { ok: true as const, userId }
}

/** GET /api/admin/hotels, full list (approved + pending) for admin panel. */
export async function GET() {
  const a = await assertAdmin()
  if (!a.ok) return NextResponse.json({ error: 'forbidden' }, { status: a.code })

  const sb = serverSupabase()
  const [{ data: hotels, error: hErr }, { data: rooms, error: rErr }] = await Promise.all([
    sb.from('hotels').select('*').order('created_at', { ascending: false }),
    sb.from('rooms').select('*'),
  ])
  if (hErr || rErr) return NextResponse.json({ error: hErr?.message || rErr?.message }, { status: 500 })
  const mapped = (hotels ?? []).map((h: any) => rowToHotel(h, rooms ?? []))
  return NextResponse.json({ hotels: mapped })
}
