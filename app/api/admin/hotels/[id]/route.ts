import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { serverSupabase } from '@/lib/supabase'
import { emailHotelApproved, emailHotelSuspended } from '@/lib/email'

export const dynamic = 'force-dynamic'

async function assertAdmin() {
  const { userId, sessionClaims } = await auth()
  if (!userId) return { ok: false as const, code: 401 }
  const role = (sessionClaims?.metadata as { role?: string } | undefined)?.role
  if (role !== 'admin') return { ok: false as const, code: 403 }
  return { ok: true as const }
}

// Strip non-digits from phone for storage consistency, preserve leading +
function normPhone(raw: unknown) {
  const s = String(raw ?? '').trim()
  if (!s) return ''
  return s.startsWith('+') ? '+' + s.slice(1).replace(/\D/g, '') : s.replace(/\D/g, '')
}

/**
 * PATCH /api/admin/hotels/[id]
 * body: { approved?: boolean } for the approve/suspend buttons, or any subset
 * of the full profile fields below for the edit form.
 */
export async function PATCH(req: Request, ctx: { params: { id: string } }) {
  const a = await assertAdmin(); if (!a.ok) return NextResponse.json({ error: 'forbidden' }, { status: a.code })
  const body = await req.json()
  const update: Record<string, unknown> = {}
  if (typeof body.approved === 'boolean') update.approved = body.approved
  if (typeof body.name === 'string') update.name = body.name.trim()
  if (body.stars !== undefined) update.stars = Math.max(1, Math.min(5, parseInt(body.stars) || 3))
  if (typeof body.location === 'string') update.location = body.location.trim()
  if (typeof body.locationLabel === 'string') update.location_label = body.locationLabel.trim()
  if (body.propertyType === 'hotel' || body.propertyType === 'houseboat') update.property_type = body.propertyType
  if (typeof body.address === 'string') update.address = body.address.trim()
  if (typeof body.phone === 'string') update.phone = normPhone(body.phone)
  if (typeof body.whatsapp === 'string') update.whatsapp_phone = normPhone(body.whatsapp)
  if (typeof body.email === 'string') update.email = body.email.trim()
  if (typeof body.website === 'string') update.website = body.website.trim()
  if (typeof body.description === 'string') update.description = body.description.trim()
  if (Array.isArray(body.amenities)) update.amenities = body.amenities
  if ('tariffStart' in body) update.tariff_start = body.tariffStart || null
  if ('tariffEnd' in body) update.tariff_end = body.tariffEnd || null
  if (typeof body.mmtUrl === 'string') update.mmt_url = body.mmtUrl.trim()
  if (typeof body.goibiboUrl === 'string') update.goibibo_url = body.goibiboUrl.trim()
  if (Object.keys(update).length === 0) return NextResponse.json({ error: 'no fields' }, { status: 400 })

  const sb = serverSupabase()

  // Pull the previous row so we know what changed + who to email.
  const { data: existing } = await sb.from('hotels')
    .select('approved, name, email, location_label')
    .eq('id', ctx.params.id)
    .maybeSingle()

  const { error } = await sb.from('hotels').update(update).eq('id', ctx.params.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Email triggers, fire only when approved status actually flipped.
  if (existing && typeof body.approved === 'boolean' && body.approved !== existing.approved && existing.email) {
    if (body.approved) {
      void emailHotelApproved({
        vendorEmail:   existing.email,
        hotelName:     existing.name,
        locationLabel: existing.location_label || '',
      })
    } else {
      void emailHotelSuspended({
        vendorEmail: existing.email,
        hotelName:   existing.name,
      })
    }
  }

  return NextResponse.json({ ok: true })
}

/** DELETE /api/admin/hotels/[id], also cascades to rooms via FK. */
export async function DELETE(_req: Request, ctx: { params: { id: string } }) {
  const a = await assertAdmin(); if (!a.ok) return NextResponse.json({ error: 'forbidden' }, { status: a.code })
  const sb = serverSupabase()
  const { error } = await sb.from('hotels').delete().eq('id', ctx.params.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
