import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import MyListing from './MyListing'

export default async function ListingPage() {
  const { sessionClaims } = await auth()
  const role = (sessionClaims?.metadata as { role?: string } | undefined)?.role
  if (role === 'admin' || role === 'customer') redirect('/dashboard')

  return <MyListing />
}
