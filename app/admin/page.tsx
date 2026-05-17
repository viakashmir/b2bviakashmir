import { auth, currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import AdminPortal from './AdminPortal'

export default async function AdminPage() {
  const { userId } = await auth()
  if (!userId) redirect('/login')
  const user = await currentUser()
  const role = (user?.publicMetadata as { role?: string } | undefined)?.role
  if (role !== 'admin') redirect('/dashboard')

  return <AdminPortal />
}
