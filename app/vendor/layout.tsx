import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import VendorShell from '@/components/vendor/VendorShell'

export default async function VendorLayout({ children }: { children: React.ReactNode }) {
  const { userId, sessionClaims } = await auth()
  if (!userId) redirect('/login')
  const role = (sessionClaims?.metadata as { role?: string } | undefined)?.role
  if (role === 'admin' || role === 'customer') redirect('/dashboard')

  return <VendorShell>{children}</VendorShell>
}
