/**
 * middleware.ts — Route-level authentication guard
 *
 * Blocks unauthenticated access to /dashboard routes at the edge level.
 * Any request to /dashboard/* without a valid session is redirected to /login.
 *
 * Uses NextAuth's built-in middleware — no custom logic needed.
 */

export { default } from 'next-auth/middleware'

export const config = {
  matcher: ['/dashboard/:path*'],
}
