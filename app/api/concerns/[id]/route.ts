import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { serverSupabase } from '@/lib/supabase'
import { emailConcernResponded } from '@/lib/email'

export const dynamic = 'force-dynamic'

/** PATCH /api/concerns/[id], admin updates status or sends response. */
export async function PATCH(req: Request, ctx: { params: { id: string } }) {
  const { userId, sessionClaims } = await auth()
  if (!userId) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 })
  const role = (sessionClaims?.metadata as { role?: string } | undefined)?.role
  if (role !== 'admin') return NextResponse.json({ error: 'forbidden' }, { status: 403 })

  const body = await req.json()
  const update: Record<string, unknown> = {}
  const responseText = typeof body.adminResponse === 'string' ? body.adminResponse.trim() : ''
  if (typeof body.status === 'string') update.status = body.status
  if (responseText) {
    update.admin_response = responseText
    update.admin_response_at = new Date().toISOString()
    if (!body.status) update.status = 'in-progress'
  }
  if (Object.keys(update).length === 0) return NextResponse.json({ error: 'no fields' }, { status: 400 })

  const sb = serverSupabase()
  const { error } = await sb.from('concerns').update(update).eq('id', ctx.params.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // If a response was added, notify the agent
  if (responseText) {
    const { data: concern } = await sb.from('concerns')
      .select('agent_email, agent_name, hotel_name, subject, status')
      .eq('id', ctx.params.id)
      .maybeSingle()
    if (concern?.agent_email) {
      void emailConcernResponded({
        agentEmail:    concern.agent_email,
        agentName:     concern.agent_name || 'there',
        hotelName:     concern.hotel_name || 'the hotel',
        subject:       concern.subject || 'your concern',
        adminResponse: responseText,
        status:        concern.status || 'in-progress',
      })
    }
  }

  return NextResponse.json({ ok: true })
}
