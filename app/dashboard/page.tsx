import { auth, clerkClient, currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

/**
 * /dashboard is the single role-router. It reads the user's FRESH metadata
 * (not sessionClaims, which lag behind metadata writes) and:
 *   1. assigns role = 'vendor' for any user with no role yet
 *      → this is the "sign-up via /login creates a hotel account" rule
 *   2. redirects to the right portal based on the resolved role
 */
export default async function DashboardRouter() {
  const { userId } = await auth()
  if (!userId) redirect('/login')

  const user = await currentUser()
  if (!user) redirect('/login')

  let role = (user.publicMetadata as { role?: string } | undefined)?.role

  if (!role) {
    // First visit: default new accounts to vendor (hotel) role.
    await (await clerkClient()).users.updateUserMetadata(userId, {
      publicMetadata: { ...user.publicMetadata, role: 'vendor' },
    })
    role = 'vendor'
  }

  if (role === 'admin')  redirect('/admin')
  if (role === 'vendor') redirect('/vendor')
  redirect('/customer')
}
