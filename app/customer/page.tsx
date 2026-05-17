import { auth, currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import CustomerPortal from './CustomerPortal'

export default async function CustomerPage() {
  const { userId } = await auth()
  if (!userId) redirect('/login')
  const user = await currentUser()
  const role = (user?.publicMetadata as { role?: string } | undefined)?.role
  // admins and vendors get bounced back through /dashboard
  if (role === 'admin' || role === 'vendor') redirect('/dashboard')

  return <CustomerPortal />
}
