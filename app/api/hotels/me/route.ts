import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { serverSupabase } from '@/lib/supabase'
import { rowToHotel } from '@/lib/data'

export const dynamic = 'force-dynamic'

function vendorHotelId(userId: string) {
  return `vendor_${userId.toLowerCase()}`
}

/** GET /api/hotels/me — vendor's own hotel (may be unapproved). */
export async function GET() {
  const { userId, sessionClaims } = await auth()
  if (!userId) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 })
  const role = (sessionClaims?.metadata as { role?: string } | undefined)?.role
  if (role && role !== 'vendor') return NextResponse.json({ error: 'forbidden' }, { status: 403 })

  const hotelId = vendorHotelId(userId)
  const sb = serverSupabase()
  const { data: hotel, error: hErr } = await sb.from('hotels').select('*').eq('id', hotelId).maybeSingle()
  if (hErr) return NextResponse.json({ error: hErr.message }, { status: 500 })
  if (!hotel) return NextResponse.json({ hotel: null })

  const { data: rooms, error: rErr } = await sb.from('rooms').select('*').eq('hotel_id', hotelId)
  if (rErr) return NextResponse.json({ error: rErr.message }, { status: 500 })
  return NextResponse.json({ hotel: rowToHotel(hotel, rooms ?? []) })
}

/** POST /api/hotels/me — upsert vendor's hotel (used by onboarding + profile edits). */
export async function POST(req: Request) {
  const { userId, sessionClaims } = await auth()
  if (!userId) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 })
  const role = (sessionClaims?.metadata as { role?: string } | undefined)?.role
  if (role && role !== 'vendor') return NextResponse.json({ error: 'forbidden' }, { status: 403 })

  const hotelId = vendorHotelId(userId)
  const body = await req.json()

  const sb = serverSupabase()
  const { data: existing } = await sb.from('hotels').select('approved, created_at').eq('id', hotelId).maybeSingle()

  const row = {
    id: hotelId,
    name: String(body.name ?? '').trim(),
    stars: Math.max(1, Math.min(5, parseInt(body.stars) || 3)),
    location: String(body.location ?? '').trim(),
    location_label: String(body.locationLabel ?? '').trim(),
    address: String(body.address ?? '').trim(),
    phone: String(body.phone ?? '').trim(),
    email: String(body.email ?? '').trim(),
    website: String(body.website ?? '').trim(),
    description: String(body.description ?? '').trim(),
    amenities: Array.isArray(body.amenities) ? body.amenities : [],
    // Vendor cannot self-approve. Preserve existing approval status; new rows default to false.
    approved: existing?.approved ?? false,
  }

  const { error } = await sb.from('hotels').upsert(row, { onConflict: 'id' })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true, id: hotelId })
}
