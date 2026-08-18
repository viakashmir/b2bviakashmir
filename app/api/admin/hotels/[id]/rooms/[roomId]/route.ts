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

const NUM_FIELDS = new Set(['ep', 'cp', 'map_rate', 'ap', 'child_wob', 'extra_bed', 'double', 'cnb', 'inventory'])
const FIELD_MAP: Record<string, string> = {
  type: 'type', category: 'category', meal: 'meal',
  ep: 'ep', cp: 'cp', map: 'map_rate', ap: 'ap',
  childWob: 'child_wob', extraBed: 'extra_bed',
  gst: 'gst', notes: 'notes',
  inventory: 'inventory', status: 'status',
  // legacy fields some callers may still send
  double: 'double', cnb: 'cnb',
}

/** PUT /api/admin/hotels/[id]/rooms/[roomId], update a room on any hotel. */
export async function PUT(req: Request, ctx: { params: { id: string; roomId: string } }) {
  const a = await assertAdmin(); if (!a.ok) return NextResponse.json({ error: 'forbidden' }, { status: a.code })

  const body = await req.json()
  const update: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(body)) {
    const col = FIELD_MAP[k]; if (!col) continue
    update[col] = NUM_FIELDS.has(col) ? (Math.max(0, parseInt(String(v)) || 0)) : v
  }
  if (Object.keys(update).length === 0) return NextResponse.json({ error: 'no fields' }, { status: 400 })

  // Keep legacy 'double'/'cnb' mirrors in sync when the modern fields change,
  // same convention the public board and 0003 migration backfill rely on.
  if ('cp' in update && !('double' in update)) update.double = update.cp
  if ('child_wob' in update && !('cnb' in update)) update.cnb = update.child_wob

  const sb = serverSupabase()
  const { error } = await sb.from('rooms').update(update).eq('id', ctx.params.roomId).eq('hotel_id', ctx.params.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await sb.from('hotels').update({ updated_at: new Date().toISOString() }).eq('id', ctx.params.id)
  return NextResponse.json({ ok: true })
}

/** DELETE /api/admin/hotels/[id]/rooms/[roomId], remove a room from any hotel. */
export async function DELETE(_req: Request, ctx: { params: { id: string; roomId: string } }) {
  const a = await assertAdmin(); if (!a.ok) return NextResponse.json({ error: 'forbidden' }, { status: a.code })

  const sb = serverSupabase()
  const { error } = await sb.from('rooms').delete().eq('id', ctx.params.roomId).eq('hotel_id', ctx.params.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await sb.from('hotels').update({ updated_at: new Date().toISOString() }).eq('id', ctx.params.id)
  return NextResponse.json({ ok: true })
}
