import { NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'
import { serverSupabase } from '@/lib/supabase'
import { rowToHotel } from '@/lib/data'
import { emailListingSubmitted } from '@/lib/email'

export const dynamic = 'force-dynamic'

function vendorHotelId(userId: string) {
  return `vendor_${userId.toLowerCase()}`
}

/** GET /api/hotels/me, vendor's own hotel (may be unapproved). */
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

/** POST /api/hotels/me, upsert vendor's hotel (used by onboarding + profile edits). */
export async function POST(req: Request) {
  const { userId, sessionClaims } = await auth()
  if (!userId) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 })
  const role = (sessionClaims?.metadata as { role?: string } | undefined)?.role
  if (role && role !== 'vendor') return NextResponse.json({ error: 'forbidden' }, { status: 403 })

  const hotelId = vendorHotelId(userId)
  const body = await req.json()

  const sb = serverSupabase()
  const { data: existing } = await sb.from('hotels').select('approved, created_at').eq('id', hotelId).maybeSingle()

  const propertyType = body.propertyType === 'houseboat' ? 'houseboat' : 'hotel'
  // Strip non-digits from phone for storage consistency, preserve leading +
  const normPhone = (raw: unknown) => {
    const s = String(raw ?? '').trim()
    if (!s) return ''
    return s.startsWith('+') ? '+' + s.slice(1).replace(/\D/g, '') : s.replace(/\D/g, '')
  }
  const phone = normPhone(body.phone)
  // WhatsApp: if the vendor said "same as phone" we mirror, otherwise normalise
  const whatsapp = body.whatsappSameAsPhone === true ? phone : normPhone(body.whatsapp)

  const row = {
    id: hotelId,
    name: String(body.name ?? '').trim(),
    stars: Math.max(1, Math.min(5, parseInt(body.stars) || 3)),
    location: String(body.location ?? '').trim(),
    location_label: String(body.locationLabel ?? '').trim(),
    property_type: propertyType,
    address: String(body.address ?? '').trim(),
    phone,
    whatsapp_phone: whatsapp,
    email: String(body.email ?? '').trim(),
    website: String(body.website ?? '').trim(),
    description: String(body.description ?? '').trim(),
    amenities: Array.isArray(body.amenities) ? body.amenities : [],
    tariff_start: body.tariffStart || null,
    tariff_end:   body.tariffEnd   || null,
    // Vendor cannot self-approve. Preserve existing approval status; new rows default to false.
    approved: existing?.approved ?? false,
  }

  const { error } = await sb.from('hotels').upsert(row, { onConflict: 'id' })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Fire the welcome email exactly once, on first submission.
  // (existing was null → this is a brand-new listing.)
  const isFirstSubmission = !existing
  if (isFirstSubmission) {
    const user = await currentUser()
    const vendorEmail = row.email || user?.primaryEmailAddress?.emailAddress
    if (vendorEmail) {
      void emailListingSubmitted({
        vendorEmail,
        vendorName: user?.firstName || undefined,
        hotelName: row.name,
        locationLabel: row.location_label || row.location,
      })
    }
  }

  // Optional: bulk-create rooms passed in onboarding
  if (Array.isArray(body.rooms) && body.rooms.length > 0) {
    type RoomInput = {
      type?: string; category?: string; meal?: string
      ep?: number | string; cp?: number | string; map?: number | string; ap?: number | string
      childWob?: number | string; extraBed?: number | string
      gst?: string; notes?: string
      inventory?: number | string; status?: string
    }
    const num = (v: unknown) => Math.max(0, parseInt(String(v ?? '0')) || 0)
    const roomRows = (body.rooms as RoomInput[])
      .filter(r => (r.type || '').toString().trim().length > 0)
      .map(r => {
        const cp = num(r.cp)
        return {
          id: 'r_' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36),
          hotel_id: hotelId,
          type: String(r.type).trim(),
          category: String(r.category ?? 'Standard'),
          meal: String(r.meal ?? 'CP'),
          ep:       num(r.ep),
          cp,
          map_rate: num(r.map),
          ap:       num(r.ap),
          child_wob: num(r.childWob),
          extra_bed: num(r.extraBed),
          // Headline 'double' kept for backwards-compat with existing public board
          double: cp || num(r.ep) || num(r.map) || num(r.ap),
          cnb: num(r.childWob), // legacy mirror
          gst: String(r.gst ?? 'as_applicable'),
          notes: String(r.notes ?? '').trim(),
          inventory: num(r.inventory),
          status: String(r.status ?? 'Available'),
        }
      })
    if (roomRows.length > 0) {
      const { error: roomErr } = await sb.from('rooms').insert(roomRows)
      if (roomErr) return NextResponse.json({ error: roomErr.message }, { status: 500 })
    }
  }

  return NextResponse.json({ ok: true, id: hotelId })
}
