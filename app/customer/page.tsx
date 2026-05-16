import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import CustomerPortal from './CustomerPortal'

export default async function CustomerPage() {
  const { userId, sessionClaims } = await auth()
  if (!userId) redirect('/login')
  const role = (sessionClaims?.metadata as { role?: string } | undefined)?.role
  // admins and vendors get bounced back to /dashboard which routes them home
  if (role === 'admin' || role === 'vendor') redirect('/dashboard')

  return <CustomerPortal />
}
