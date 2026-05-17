import { auth, clerkClient } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

/**
 * Lands here right after Clerk completes a sign-up flow on /signup.
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

  redirect('/dashboard')
}
