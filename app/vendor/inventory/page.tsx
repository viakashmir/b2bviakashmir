import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import InventoryCalendar from './InventoryCalendar'

export default async function InventoryPage() {
  const { sessionClaims } = await auth()
  const role = (sessionClaims?.metadata as { role?: string } | undefined)?.role
  if (role === 'admin' || role === 'customer') redirect('/dashboard')

  return <InventoryCalendar />
}
