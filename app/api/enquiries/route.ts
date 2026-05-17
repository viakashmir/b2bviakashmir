import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { serverSupabase } from '@/lib/supabase'
import { rowToEnquiry } from '@/lib/data'
import { emailEnquirySent } from '@/lib/email'

export const dynamic = 'force-dynamic'

/** GET /api/enquiries, admin-only listing of every WhatsApp enquiry. */
export async function GET() {
  const { userId, sessionClaims } = await auth()
  if (!userId) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 })
  const role = (sessionClaims?.metadata as { role?: string } | undefined)?.role
  if (role !== 'admin') return NextResponse.json({ error: 'forbidden' }, { status: 403 })

  const sb = serverSupabase()
  const { data, error } = await sb.from('enquiries').select('*').order('created_at', { ascending: false }).limit(500)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ enquiries: (data ?? []).map(rowToEnquiry) })
}

/**
 * POST /api/enquiries, public endpoint. A traveller on the public
 * board submits trip details + name/phone; we log the row, fire
 * notification emails and return the wa.me deep-link the client opens.
 */
export async function POST(req: Request) {
  const body = await req.json()
  const hotelId = String(body.hotelId ?? '').trim()
  const travellerName  = String(body.travellerName  ?? '').trim()
  const travellerPhone = String(body.travellerPhone ?? '').replace(/[^\d+]/g, '')

  if (!hotelId)        return NextResponse.json({ error: 'hotelId required' },        { status: 400 })
  if (!travellerName)  return NextResponse.json({ error: 'name required' },             { status: 400 })
  // Strip the country-code prefix (if any) to validate the local 10-digit number.
  // We accept +91XXXXXXXXXX or 10 raw digits; anything else is rejected.
  {
    const digits = travellerPhone.replace(/\D/g, '')
    const local = digits.length === 12 && digits.startsWith('91') ? digits.slice(2) : digits
    if (local.length !== 10 || !/^[6-9]/.test(local)) {
      return NextResponse.json({ error: 'Phone must be a valid 10-digit Indian mobile number.' }, { status: 400 })
    }
  }

  const sb = serverSupabase()
  const { data: hotel, error: hErr } = await sb
    .from('hotels')
    .select('id, name, phone, whatsapp_phone, email, approved')
    .eq('id', hotelId)
    .maybeSingle()
  if (hErr)             return NextResponse.json({ error: hErr.message }, { status: 500 })
  if (!hotel)           return NextResponse.json({ error: 'hotel not found' }, { status: 404 })
  if (!hotel.approved)  return NextResponse.json({ error: 'hotel not live' },  { status: 403 })

  // Normalise trip details
  const num = (v: unknown, fallback = 0) => {
    const n = parseInt(String(v ?? '')) || fallback
    return Math.max(0, n)
  }
  const checkIn  = typeof body.checkIn  === 'string' && body.checkIn  ? body.checkIn  : null
  const checkOut = typeof body.checkOut === 'string' && body.checkOut ? body.checkOut : null
  let nights = 0
  if (checkIn && checkOut) {
    const a = new Date(checkIn).getTime()
    const b = new Date(checkOut).getTime()
    nights = Math.max(0, Math.round((b - a) / 86400000))
  }
  const rooms    = Math.max(1, num(body.rooms, 1))
  const adults   = Math.max(1, num(body.adults, 2))
  const children = num(body.children, 0)
  const notes    = String(body.notes ?? '').trim().slice(0, 500)

  // Build the WhatsApp deep link
  const target = (hotel.whatsapp_phone || hotel.phone || '').replace(/\D/g, '')
  if (!target) return NextResponse.json({ error: 'hotel has no contact number' }, { status: 400 })
  // wa.me wants a country-coded number with no +; assume Indian 91 if 10 digits
  const waNumber = target.length === 10 ? '91' + target : target

  const pretty = (iso: string) => {
    if (!iso) return ''
    const d = new Date(iso)
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
  }
  const stayLine = checkIn && checkOut
    ? `*Stay:* ${pretty(checkIn)} → ${pretty(checkOut)} (${nights} night${nights === 1 ? '' : 's'})`
    : '*Stay:* Dates flexible'
  const paxLine = `*Party:* ${rooms} room${rooms === 1 ? '' : 's'} · ${adults} adult${adults === 1 ? '' : 's'}${children > 0 ? ` + ${children} child${children === 1 ? '' : 'ren'}` : ''}`
  const lines = [
    `Hello ${hotel.name},`,
    '',
    `I would like to enquire for a stay.`,
    stayLine,
    paxLine,
  ]
  if (notes) lines.push('', `*Note:* ${notes}`)
  lines.push('', `- ${travellerName}`, `Phone: ${travellerPhone}`, '', `(Sent via Via Kashmir B2B)`)
  const text = lines.join('\n')
  const whatsappLink = `https://wa.me/${waNumber}?text=${encodeURIComponent(text)}`

  const id = 'eq_' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36)
  const { error: insErr } = await sb.from('enquiries').insert({
    id,
    hotel_id: hotelId,
    hotel_name: hotel.name,
    traveller_name: travellerName,
    traveller_phone: travellerPhone,
    check_in:  checkIn,
    check_out: checkOut,
    nights, rooms, adults, children,
    notes,
    whatsapp_link: whatsappLink,
  })
  if (insErr) return NextResponse.json({ error: insErr.message }, { status: 500 })

  // Best-effort notification (admin always, vendor if email on file)
  void emailEnquirySent({
    vendorEmail: hotel.email || undefined,
    hotelName: hotel.name,
    travellerName,
    travellerPhone,
    checkIn: checkIn ?? '',
    checkOut: checkOut ?? '',
    nights, rooms, adults, children,
    notes,
    whatsappLink,
  })

  return NextResponse.json({ ok: true, whatsappLink, id })
}
