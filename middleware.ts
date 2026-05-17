import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isProtected = createRouteMatcher([
  '/dashboard(.*)',
  '/admin(.*)',
  '/vendor(.*)',
  '/customer(.*)',
])

export default clerkMiddleware(async (auth, req) => {
  if (!isProtected(req)) return
  const { userId, redirectToSignIn } = await auth()
  if (!userId) return redirectToSignIn()
  // Role-based redirect happens inside /dashboard/page.tsx so it can read
  // FRESH user metadata via clerkClient (sessionClaims lag right after a
  // metadata mutation, which is exactly the moment we need it on signup).
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
