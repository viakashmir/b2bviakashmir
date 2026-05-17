import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { serverSupabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

/** PATCH /api/concerns/[id] — admin updates status or sends response. */
export async function PATCH(req: Request, ctx: { params: { id: string } }) {
  const { userId, sessionClaims } = await auth()
  if (!userId) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 })
  const role = (sessionClaims?.metadata as { role?: string } | undefined)?.role
  if (role !== 'admin') return NextResponse.json({ error: 'forbidden' }, { status: 403 })

  const body = await req.json()
  const update: Record<string, unknown> = {}
  if (typeof body.status === 'string') update.status = body.status
  if (typeof body.adminResponse === 'string') {
    update.admin_response = body.adminResponse
    update.admin_response_at = new Date().toISOString()
    if (!body.status) update.status = 'in-progress'
  }
  if (Object.keys(update).length === 0) return NextResponse.json({ error: 'no fields' }, { status: 400 })

  const sb = serverSupabase()
  const { error } = await sb.from('concerns').update(update).eq('id', ctx.params.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
