import { auth, currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import VendorPortal from './VendorPortal'

export default async function VendorPage() {
  const { userId } = await auth()
  if (!userId) redirect('/login')
  const user = await currentUser()
  const role = (user?.publicMetadata as { role?: string } | undefined)?.role
  if (role !== 'vendor') redirect('/dashboard')

  return <VendorPortal />
}
