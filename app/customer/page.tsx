import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import CustomerPortal from './CustomerPortal'

export default async function CustomerPage() {
  const { sessionClaims } = await auth()
  const role = (sessionClaims?.metadata as { role?: string } | undefined)?.role
  if (role !== 'customer') redirect('/dashboard')

  return <CustomerPortal />
}
