import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

// 1. Tell Clerk these routes don't require an active login session
const isPublicRoute = createRouteMatcher([
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/',
  '/sitemap.xml',
  '/robots.txt',
  '/api/payment/create-order',
  '/api/payment/verify',
])

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    await auth.protect()
  }
})

export const config = {
  matcher: [
    // 2. FORCE Next.js to skip this entire middleware file for sitemap and robots
    '/((?!_next|sitemap\\.xml|robots\\.txt|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}