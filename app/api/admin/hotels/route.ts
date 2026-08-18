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

function slugify(name: string) {
  return name.toLowerCase().trim()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 40) || 'hotel'
}

// Strip non-digits from phone for storage consistency, preserve leading +
function normPhone(raw: unknown) {
  const s = String(raw ?? '').trim()
  if (!s) return ''
  return s.startsWith('+') ? '+' + s.slice(1).replace(/\D/g, '') : s.replace(/\D/g, '')
}

/** POST /api/admin/hotels, create a new hotel directly (no vendor signup needed). */
export async function POST(req: Request) {
  const a = await assertAdmin()
  if (!a.ok) return NextResponse.json({ error: 'forbidden' }, { status: a.code })

  const body = await req.json()
  const name = String(body.name ?? '').trim()
  if (!name) return NextResponse.json({ error: 'Hotel name is required.' }, { status: 400 })

  const sb = serverSupabase()

  // Derive a unique id from the name: admin_<slug>, admin_<slug>_2, …
  const base = `admin_${slugify(name)}`
  let id = base
  for (let n = 2; ; n++) {
    const { data: clash } = await sb.from('hotels').select('id').eq('id', id).maybeSingle()
    if (!clash) break
    id = `${base}_${n}`
  }

  const phone = normPhone(body.phone)
  const whatsapp = body.whatsappSameAsPhone === true ? phone : normPhone(body.whatsapp)

  const row = {
    id,
    name,
    stars: Math.max(1, Math.min(5, parseInt(body.stars) || 3)),
    location: String(body.location ?? '').trim(),
    location_label: String(body.locationLabel ?? '').trim(),
    property_type: body.propertyType === 'houseboat' ? 'houseboat' : 'hotel',
    address: String(body.address ?? '').trim(),
    phone,
    whatsapp_phone: whatsapp,
    email: String(body.email ?? '').trim(),
    website: String(body.website ?? '').trim(),
    description: String(body.description ?? '').trim(),
    amenities: Array.isArray(body.amenities) ? body.amenities : [],
    tariff_start: body.tariffStart || null,
    tariff_end: body.tariffEnd || null,
    // Admin-created listings are live immediately unless explicitly unchecked.
    approved: body.approved !== false,
  }

  const { error } = await sb.from('hotels').insert(row)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Optional: bulk-create rooms passed at creation time.
  if (Array.isArray(body.rooms) && body.rooms.length > 0) {
    const num = (v: unknown) => Math.max(0, parseInt(String(v ?? '0')) || 0)
    const roomRows = (body.rooms as Record<string, unknown>[])
      .filter(r => String(r.type ?? '').trim().length > 0)
      .map(r => {
        const cp = num(r.cp)
        return {
          id: 'r_' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36),
          hotel_id: id,
          type: String(r.type).trim(),
          category: String(r.category ?? 'Standard'),
          meal: String(r.meal ?? 'CP'),
          ep: num(r.ep), cp, map_rate: num(r.map), ap: num(r.ap),
          child_wob: num(r.childWob), extra_bed: num(r.extraBed),
          double: cp || num(r.ep) || num(r.map) || num(r.ap),
          cnb: num(r.childWob),
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

  return NextResponse.json({ ok: true, id })
}
