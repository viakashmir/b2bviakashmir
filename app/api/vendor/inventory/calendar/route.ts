import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { serverSupabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

function vendorHotelId(userId: string) {
  return `vendor_${userId.toLowerCase()}`
}
function pad(n: number) { return String(n).padStart(2, '0') }
function ymd(y: number, m: number, d: number) { return `${y}-${pad(m)}-${pad(d)}` }
function daysInMonth(y: number, m: number) { return new Date(y, m, 0).getDate() }

/**
 * GET /api/vendor/inventory/calendar?year=YYYY&month=MM
 *
 * Returns per-day availability for every room type in the vendor's hotel,
 * accounting for inventory_blocks that overlap each day.
 */
export async function GET(req: Request) {
  const { userId, sessionClaims } = await auth()
  if (!userId) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 })
  const role = (sessionClaims?.metadata as { role?: string } | undefined)?.role
  if (role && role !== 'vendor') return NextResponse.json({ error: 'forbidden' }, { status: 403 })

  const u = new URL(req.url)
  const now = new Date()
  const year  = parseInt(u.searchParams.get('year')  || String(now.getFullYear()))
  const month = parseInt(u.searchParams.get('month') || String(now.getMonth() + 1))
  if (month < 1 || month > 12 || year < 2000) {
    return NextResponse.json({ error: 'invalid year/month' }, { status: 400 })
  }

  const hotelId = vendorHotelId(userId)
  const sb = serverSupabase()

  const start = ymd(year, month, 1)
  const end   = ymd(year, month, daysInMonth(year, month))

  const [{ data: rooms, error: rErr }, { data: blocks, error: bErr }] = await Promise.all([
    sb.from('rooms').select('*').eq('hotel_id', hotelId),
    sb.from('inventory_blocks').select('*')
      .eq('hotel_id', hotelId)
      .lte('start_date', end)
      .gte('end_date',   start),
  ])
  if (rErr) return NextResponse.json({ error: rErr.message }, { status: 500 })
  if (bErr) return NextResponse.json({ error: bErr.message }, { status: 500 })

  // Map each room → its array of per-day blocked counts for the month
  type Row = { id: string; hotel_id: string; room_id: string | null; start_date: string; end_date: string; count: number; block_type: string; reason: string; source: string; ota_name: string | null }
  const blockRows = (blocks ?? []) as Row[]

  const totalDays = daysInMonth(year, month)
  const days: Array<{
    date: string
    day: number
    status: 'available' | 'partial' | 'full' | 'past'
    totalRooms: number
    totalBlocked: number
    totalAvailable: number
    rooms: Array<{ id: string; type: string; total: number; blocked: number; available: number }>
    blocks: Array<{ id: string; type: string; reason: string; count: number; roomId: string | null; otaName: string | null }>
  }> = []

  const today = new Date(); today.setHours(0,0,0,0)

  for (let d = 1; d <= totalDays; d++) {
    const date = ymd(year, month, d)
    const day = new Date(year, month - 1, d)
    const isPast = day.getTime() < today.getTime()

    const activeBlocks = blockRows.filter(b => b.start_date <= date && b.end_date >= date)
    const perRoom = (rooms ?? []).map(rm => {
      const blocked = activeBlocks
        .filter(b => b.room_id === rm.id || b.room_id === null)
        .reduce((s, b) => s + (b.count || 0), 0)
      const total = rm.inventory ?? 0
      return { id: rm.id, type: rm.type, total, blocked: Math.min(blocked, total), available: Math.max(0, total - blocked) }
    })

    const totalRooms     = perRoom.reduce((s, r) => s + r.total, 0)
    const totalBlocked   = perRoom.reduce((s, r) => s + r.blocked, 0)
    const totalAvailable = perRoom.reduce((s, r) => s + r.available, 0)

    const status: 'available' | 'partial' | 'full' | 'past' =
      isPast ? 'past' :
      totalAvailable === 0 ? 'full' :
      totalAvailable < totalRooms ? 'partial' :
      'available'

    days.push({
      date, day: d, status,
      totalRooms, totalBlocked, totalAvailable,
      rooms: perRoom,
      blocks: activeBlocks.map(b => ({
        id: b.id, type: b.block_type, reason: b.reason, count: b.count,
        roomId: b.room_id, otaName: b.ota_name,
      })),
    })
  }

  return NextResponse.json({
    year, month,
    rooms: (rooms ?? []).map(r => ({ id: r.id, type: r.type, category: r.category, inventory: r.inventory })),
    days,
  })
}
