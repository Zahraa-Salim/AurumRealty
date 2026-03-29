/**
 * middleware.ts
 *
 * Edge middleware — protects all /dashboard/* routes.
 * Unauthenticated users are redirected to /login instead of
 * reaching the dashboard and seeing an "Access Denied" screen.
 */

import { withAuth } from 'next-auth/middleware'

export default withAuth({
  pages: {
    signIn: '/login',
  },
})

export const config = {
  matcher: ['/dashboard/:path*'],
}
