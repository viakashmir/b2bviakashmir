import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import VendorPortal from './VendorPortal'

export default async function VendorPage() {
  const { sessionClaims } = await auth()
  const role = (sessionClaims?.metadata as { role?: string } | undefined)?.role
  if (role !== 'vendor') redirect('/dashboard')

  return <VendorPortal />
}
