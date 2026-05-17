import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { serverSupabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

function vendorHotelId(userId: string) {
  return `vendor_${userId.toLowerCase()}`
}

/** POST /api/vendor/inventory/blocks — create a date-range block. */
export async function POST(req: Request) {
  const { userId, sessionClaims } = await auth()
  if (!userId) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 })
  const role = (sessionClaims?.metadata as { role?: string } | undefined)?.role
  if (role && role !== 'vendor') return NextResponse.json({ error: 'forbidden' }, { status: 403 })

  const body = await req.json()
  if (!body.startDate || !body.endDate) {
    return NextResponse.json({ error: 'startDate and endDate are required' }, { status: 400 })
  }
  if (body.endDate < body.startDate) {
    return NextResponse.json({ error: 'endDate must be on or after startDate' }, { status: 400 })
  }

  const hotelId = vendorHotelId(userId)
  const sb = serverSupabase()

  // If room_id provided, ensure it belongs to this hotel
  if (body.roomId) {
    const { data: room } = await sb.from('rooms').select('id').eq('id', body.roomId).eq('hotel_id', hotelId).maybeSingle()
    if (!room) return NextResponse.json({ error: 'room not found on your hotel' }, { status: 404 })
  }

  const id = 'blk_' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36)
  const blockType = String(body.blockType ?? 'blocked')
  const reason = String(body.reason ?? (body.otaName ? `OTA: ${body.otaName}` : 'Manual block'))

  const { error } = await sb.from('inventory_blocks').insert({
    id,
    hotel_id: hotelId,
    room_id: body.roomId ?? null,
    start_date: body.startDate,
    end_date: body.endDate,
    block_type: blockType,
    reason,
    count: Math.max(1, parseInt(body.count) || 1),
    source: body.otaName ? 'ical_import' : 'vendor_manual',
    ota_name: body.otaName ?? null,
  })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true, id })
}
