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

/** PATCH /api/admin/hotels/[id]  body: { approved?: boolean } */
export async function PATCH(req: Request, ctx: { params: { id: string } }) {
  const a = await assertAdmin(); if (!a.ok) return NextResponse.json({ error: 'forbidden' }, { status: a.code })
  const body = await req.json()
  const update: Record<string, unknown> = {}
  if (typeof body.approved === 'boolean') update.approved = body.approved
  if (Object.keys(update).length === 0) return NextResponse.json({ error: 'no fields' }, { status: 400 })

  const sb = serverSupabase()
  const { error } = await sb.from('hotels').update(update).eq('id', ctx.params.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

/** DELETE /api/admin/hotels/[id] — also cascades to rooms via FK. */
export async function DELETE(_req: Request, ctx: { params: { id: string } }) {
  const a = await assertAdmin(); if (!a.ok) return NextResponse.json({ error: 'forbidden' }, { status: a.code })
  const sb = serverSupabase()
  const { error } = await sb.from('hotels').delete().eq('id', ctx.params.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
