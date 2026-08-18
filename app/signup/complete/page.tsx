import { auth, clerkClient, currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { claimExistingHotelListing } from '@/lib/hotelHandoff'

/**
 * Lands here right after Clerk completes a sign-up flow on /signup —
 * both organic sign-ups and admin-sent invitations (Clerk routes
 * invitation acceptance through the same <SignUp/> + redirect here).
 * Assigns publicMetadata.role = 'vendor' once, then forwards to /dashboard
 * (middleware reads sessionClaims.metadata.role and routes to /vendor).
 */
export default async function SignupComplete() {
  const { userId, sessionClaims } = await auth()
  if (!userId) redirect('/login')

  const role = (sessionClaims?.metadata as { role?: string } | undefined)?.role
  if (!role) {
    await (await clerkClient()).users.updateUserMetadata(userId, {
      publicMetadata: { role: 'vendor' },
    })
  }

  // If this email matches an existing admin-managed listing, hand it over
  // instead of leaving them to start a blank one via onboarding.
  const email = (await currentUser())?.primaryEmailAddress?.emailAddress
  if (email) await claimExistingHotelListing(email, userId)

  redirect('/dashboard')
}
