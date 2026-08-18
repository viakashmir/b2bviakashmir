import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { serverSupabase } from '@/lib/supabase'
import { inviteVendor } from '@/lib/hotelHandoff'

export const dynamic = 'force-dynamic'

async function assertAdmin() {
  const { userId, sessionClaims } = await auth()
  if (!userId) return { ok: false as const, code: 401 }
  const role = (sessionClaims?.metadata as { role?: string } | undefined)?.role
  if (role !== 'admin') return { ok: false as const, code: 403 }
  return { ok: true as const }
}

/** POST /api/admin/hotels/[id]/invite, send (or resend) a vendor login invite for this hotel's email. */
export async function POST(_req: Request, ctx: { params: { id: string } }) {
  const a = await assertAdmin(); if (!a.ok) return NextResponse.json({ error: 'forbidden' }, { status: a.code })

  const sb = serverSupabase()
  const { data: hotel, error } = await sb.from('hotels').select('id, email').eq('id', ctx.params.id).maybeSingle()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!hotel) return NextResponse.json({ error: 'Hotel not found.' }, { status: 404 })
  if (hotel.id.startsWith('vendor_')) {
    return NextResponse.json({ error: 'This hotel is already tied to a vendor login.' }, { status: 400 })
  }

  const result = await inviteVendor(hotel.email)
  if (!result.ok) return NextResponse.json({ error: result.message }, { status: 400 })
  return NextResponse.json({ ok: true, message: result.message })
}
