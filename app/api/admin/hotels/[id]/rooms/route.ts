import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { serverSupabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

async function assertAdmin() {
  const { userId, sessionClaims } = await auth()
  if (!userId) return { ok: false as const, code: 401 }
  const role = (sessionClaims?.metadata as { role?: string } | undefined)?.role
  if (role !== 'admin') return { ok: false as const, code: 403 }
  return { ok: true as const }
}

/** POST /api/admin/hotels/[id]/rooms, add a room to any hotel. */
export async function POST(req: Request, ctx: { params: { id: string } }) {
  const a = await assertAdmin(); if (!a.ok) return NextResponse.json({ error: 'forbidden' }, { status: a.code })

  const hotelId = ctx.params.id
  const body = await req.json()
  const type = String(body.type ?? '').trim()
  if (!type) return NextResponse.json({ error: 'Room type name is required.' }, { status: 400 })

  const num = (v: unknown) => Math.max(0, parseInt(String(v ?? '0')) || 0)
  const cp = num(body.cp)
  const id = 'r_' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36)

  const sb = serverSupabase()
  const { error } = await sb.from('rooms').insert({
    id,
    hotel_id: hotelId,
    type,
    category: String(body.category ?? 'Standard'),
    meal: String(body.meal ?? 'CP'),
    ep: num(body.ep), cp, map_rate: num(body.map), ap: num(body.ap),
    child_wob: num(body.childWob), extra_bed: num(body.extraBed),
    double: cp || num(body.ep) || num(body.map) || num(body.ap),
    cnb: num(body.childWob),
    gst: String(body.gst ?? 'as_applicable'),
    notes: String(body.notes ?? '').trim(),
    inventory: num(body.inventory),
    status: String(body.status ?? 'Available'),
  })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await sb.from('hotels').update({ updated_at: new Date().toISOString() }).eq('id', hotelId)
  return NextResponse.json({ ok: true, id })
}
