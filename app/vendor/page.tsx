import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import VendorPortal from './VendorPortal'

export default async function VendorPage() {
  const { sessionClaims } = await auth()
  const role = (sessionClaims?.metadata as { role?: string } | undefined)?.role
  // Vendor portal is the default for users with no role set yet (fresh hotel signup).
  if (role === 'admin' || role === 'customer') redirect('/dashboard')

  return <VendorPortal />
}
