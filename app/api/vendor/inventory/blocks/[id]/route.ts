import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { serverSupabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

function vendorHotelId(userId: string) {
  return `vendor_${userId.toLowerCase()}`
}

/** DELETE /api/vendor/inventory/blocks/[id], remove a block. */
export async function DELETE(_req: Request, ctx: { params: { id: string } }) {
  const { userId, sessionClaims } = await auth()
  if (!userId) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 })
  const role = (sessionClaims?.metadata as { role?: string } | undefined)?.role
  if (role && role !== 'vendor') return NextResponse.json({ error: 'forbidden' }, { status: 403 })

  const hotelId = vendorHotelId(userId)
  const sb = serverSupabase()
  const { error } = await sb.from('inventory_blocks').delete()
    .eq('id', ctx.params.id).eq('hotel_id', hotelId)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
