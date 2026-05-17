import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { serverSupabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

function vendorHotelId(userId: string) {
  return `vendor_${userId.toLowerCase()}`
}

const FIELD_MAP: Record<string, string> = {
  type: 'type', category: 'category', meal: 'meal',
  double: 'double', cnb: 'cnb', extraBed: 'extra_bed',
  inventory: 'inventory', status: 'status',
}

/** PUT /api/hotels/me/rooms/[roomId] — update a room on vendor's own hotel. */
export async function PUT(req: Request, ctx: { params: { roomId: string } }) {
  const { userId, sessionClaims } = await auth()
  if (!userId) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 })
  const role = (sessionClaims?.metadata as { role?: string } | undefined)?.role
  if (role && role !== 'vendor') return NextResponse.json({ error: 'forbidden' }, { status: 403 })

  const hotelId = vendorHotelId(userId)
  const body = await req.json()
  const update: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(body)) {
    const col = FIELD_MAP[k]; if (!col) continue
    update[col] = (['double','cnb','extra_bed','inventory'].includes(col)) ? (parseInt(String(v)) || 0) : v
  }

  const sb = serverSupabase()
  const { error } = await sb.from('rooms').update(update).eq('id', ctx.params.roomId).eq('hotel_id', hotelId)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await sb.from('hotels').update({ updated_at: new Date().toISOString() }).eq('id', hotelId)
  return NextResponse.json({ ok: true })
}

/** DELETE /api/hotels/me/rooms/[roomId] — remove a room. */
export async function DELETE(_req: Request, ctx: { params: { roomId: string } }) {
  const { userId, sessionClaims } = await auth()
  if (!userId) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 })
  const role = (sessionClaims?.metadata as { role?: string } | undefined)?.role
  if (role && role !== 'vendor') return NextResponse.json({ error: 'forbidden' }, { status: 403 })

  const hotelId = vendorHotelId(userId)
  const sb = serverSupabase()
  const { error } = await sb.from('rooms').delete().eq('id', ctx.params.roomId).eq('hotel_id', hotelId)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await sb.from('hotels').update({ updated_at: new Date().toISOString() }).eq('id', hotelId)
  return NextResponse.json({ ok: true })
}
