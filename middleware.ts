import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/admin(.*)',
  '/vendor(.*)',
  '/customer(.*)',
])

export default clerkMiddleware(async (auth, req) => {
  if (!isProtectedRoute(req)) return

  const { userId, sessionClaims, redirectToSignIn } = await auth()
  if (!userId) return redirectToSignIn()

  if (req.nextUrl.pathname === '/dashboard') {
    const role = (sessionClaims?.metadata as { role?: string } | undefined)?.role

    if (role === 'admin')    return NextResponse.redirect(new URL('/admin', req.url))
    if (role === 'customer') return NextResponse.redirect(new URL('/customer', req.url))
    return NextResponse.redirect(new URL('/vendor', req.url))
  }
})

export const config = {
  matcher: ['/((?!_next|.*\\..*).*)'],
}
