import { clerkClient } from '@clerk/nextjs/server'
import { serverSupabase } from '@/lib/supabase'
import { appUrl } from '@/lib/email'

/**
 * Server-only. When a Clerk vendor account's email matches an existing
 * admin-managed hotel listing (bulk-imported via seed SQL, or created
 * directly from the admin panel) that isn't tied to any vendor account
 * yet, hand that listing over to them instead of leaving them to start
 * a blank one via onboarding.
 *
 * Renames the hotel's id to the standard `vendor_<userId>` form so every
 * existing lookup (which always derives the id from the Clerk user id)
 * keeps working unmodified. Rooms don't have ON UPDATE CASCADE on their
 * hotel_id FK, so the rename is done as insert-new / repoint-rooms /
 * delete-old rather than a plain UPDATE of the primary key.
 *
 * No-ops (and is safe to call unconditionally) when the vendor already
 * has a hotel, or when no unclaimed listing matches their email.
 */
export async function claimExistingHotelListing(email: string, userId: string): Promise<void> {
  if (!email) return
  const newId = `vendor_${userId.toLowerCase()}`
  const sb = serverSupabase()

  const { data: already } = await sb.from('hotels').select('id').eq('id', newId).maybeSingle()
  if (already) return // this vendor already has a hotel, never overwrite it

  const { data: candidate } = await sb.from('hotels')
    .select('*')
    .ilike('email', email)
    .not('id', 'like', 'vendor_%')
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle()
  if (!candidate) return

  const { id: oldId, ...rest } = candidate as Record<string, unknown> & { id: string }

  const { error: insertErr } = await sb.from('hotels').insert({ ...rest, id: newId })
  if (insertErr) {
    console.error('[hotelHandoff] failed to insert renamed hotel row:', insertErr.message)
    return
  }
  const { error: repointErr } = await sb.from('rooms').update({ hotel_id: newId }).eq('hotel_id', oldId)
  if (repointErr) {
    console.error('[hotelHandoff] failed to repoint rooms, leaving both hotel rows in place:', repointErr.message)
    return
  }
  await sb.from('hotels').delete().eq('id', oldId)
}

/**
 * Server-only. Invites a hotel's own email to a vendor login via Clerk
 * (no password ever set or transmitted by us — Clerk emails an accept
 * link and the hotel sets their own password on first login, with
 * "forgot password" available from day one). Deliberately not called
 * automatically for pre-existing hotels; only for hotels newly created
 * via the admin panel, and on-demand via the "Send Login Invite" button,
 * so real inboxes never get emailed without an explicit trigger.
 */
export async function inviteVendor(email: string): Promise<{ ok: boolean; message: string }> {
  if (!email) return { ok: false, message: 'This hotel has no email on file yet — add one first.' }
  try {
    await (await clerkClient()).invitations.createInvitation({
      emailAddress: email,
      publicMetadata: { role: 'vendor' },
      notify: true,
      redirectUrl: `${appUrl()}/signup`,
    })
    return { ok: true, message: `Login invite sent to ${email}.` }
  } catch (e) {
    const err = e as { errors?: { message?: string; longMessage?: string }[]; message?: string }
    const detail = err.errors?.[0]?.longMessage || err.errors?.[0]?.message || err.message || ''
    if (/already exists|already been invited|duplicate/i.test(detail)) {
      return {
        ok: false,
        message: `${email} already has a Via Kashmir login. Ask them to sign in at /login — this listing will link to their account automatically.`,
      }
    }
    console.error('[hotelHandoff] invite failed:', detail)
    return { ok: false, message: detail || 'Could not send invite.' }
  }
}
