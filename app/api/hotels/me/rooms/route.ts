import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { serverSupabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

function vendorHotelId(userId: string) {
  return `vendor_${userId.toLowerCase()}`
}

/** POST /api/hotels/me/rooms — add a room to vendor's own hotel. */
export async function POST(req: Request) {
  const { userId, sessionClaims } = await auth()
  if (!userId) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 })
  const role = (sessionClaims?.metadata as { role?: string } | undefined)?.role
  if (role && role !== 'vendor') return NextResponse.json({ error: 'forbidden' }, { status: 403 })

  const hotelId = vendorHotelId(userId)
  const body = await req.json()
  const id = 'r_' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36)

  const sb = serverSupabase()
  const { error } = await sb.from('rooms').insert({
    id,
    hotel_id: hotelId,
    type: String(body.type ?? '').trim(),
    category: String(body.category ?? 'Standard'),
    meal: String(body.meal ?? 'CP'),
    double: parseInt(body.double) || 0,
    cnb: parseInt(body.cnb) || 0,
    extra_bed: parseInt(body.extraBed) || 0,
    inventory: parseInt(body.inventory) || 0,
    status: String(body.status ?? 'Available'),
  })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Touch hotel updated_at so the public board's "Updated …" timestamp reflects the change.
  await sb.from('hotels').update({ updated_at: new Date().toISOString() }).eq('id', hotelId)

  return NextResponse.json({ ok: true, id })
}
