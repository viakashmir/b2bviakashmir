import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const isProtected = createRouteMatcher([
  '/dashboard(.*)',
  '/admin(.*)',
  '/vendor(.*)',
  '/customer(.*)',
])

export default clerkMiddleware(async (auth, req) => {
  if (!isProtected(req)) return

  const { userId, sessionClaims, redirectToSignIn } = await auth()
  if (!userId) return redirectToSignIn()

  // Role-based redirect from /dashboard
  if (req.nextUrl.pathname === '/dashboard') {
    const role = (sessionClaims?.metadata as { role?: string } | undefined)?.role
    if (role === 'admin')  return NextResponse.redirect(new URL('/admin', req.url))
    if (role === 'vendor') return NextResponse.redirect(new URL('/vendor', req.url))
    // default: travel agent / customer
    return NextResponse.redirect(new URL('/customer', req.url))
  }
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
