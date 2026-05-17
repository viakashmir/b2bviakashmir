import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import AdminPortal from './AdminPortal'

export default async function AdminPage() {
  const { sessionClaims } = await auth()
  const role = (sessionClaims?.metadata as { role?: string } | undefined)?.role
  if (role !== 'admin') redirect('/dashboard')

  return <AdminPortal />
}
