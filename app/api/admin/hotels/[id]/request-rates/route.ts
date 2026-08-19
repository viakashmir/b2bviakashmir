import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { serverSupabase } from '@/lib/supabase'
import { emailRateExpired } from '@/lib/email'

export const dynamic = 'force-dynamic'

async function assertAdmin() {
  const { userId, sessionClaims } = await auth()
  if (!userId) return { ok: false as const, code: 401 }
  const role = (sessionClaims?.metadata as { role?: string } | undefined)?.role
  if (role !== 'admin') return { ok: false as const, code: 403 }
  return { ok: true as const }
}

/**
 * POST /api/admin/hotels/[id]/request-rates
 * Emails the hotel that its tariff period has expired and its listing is
 * hidden, asking them to save a fresh tariff window. On-demand only, from
 * the admin panel's Expired Rates tab.
 */
export async function POST(_req: Request, ctx: { params: { id: string } }) {
  const a = await assertAdmin(); if (!a.ok) return NextResponse.json({ error: 'forbidden' }, { status: a.code })

  const sb = serverSupabase()
  const { data: hotel, error } = await sb.from('hotels')
    .select('name, email, location_label, tariff_end')
    .eq('id', ctx.params.id)
    .maybeSingle()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!hotel) return NextResponse.json({ error: 'hotel not found' }, { status: 404 })
  if (!hotel.email) return NextResponse.json({ error: 'This hotel has no email on file yet — add one first.' }, { status: 400 })

  await emailRateExpired({
    vendorEmail:   hotel.email,
    hotelName:     hotel.name,
    locationLabel: hotel.location_label || '',
    tariffEnd:     hotel.tariff_end || '',
  })

  return NextResponse.json({ ok: true, message: `Rate update request sent to ${hotel.email}.` })
}
