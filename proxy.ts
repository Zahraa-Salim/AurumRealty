import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getRequiredPermissionsForDashboardPath, hasAnyPermission } from '@/lib/rbac'

type CachedPermissionsVersion = {
  permissionsVersion: number | null
  expiresAt: number
}

const globalForPermissionsVersion = globalThis as typeof globalThis & {
  permissionsVersionCache?: Map<string, CachedPermissionsVersion>
}

function getPermissionsVersionCache() {
  if (!globalForPermissionsVersion.permissionsVersionCache) {
    globalForPermissionsVersion.permissionsVersionCache = new Map()
  }

  return globalForPermissionsVersion.permissionsVersionCache
}

async function getCurrentPermissionsVersion(userId: string) {
  const cache = getPermissionsVersionCache()
  const now = Date.now()
  const cached = cache.get(userId)

  if (cached && cached.expiresAt > now) {
    return cached.permissionsVersion
  }

  const user = await prisma.user.findUnique({
    where: { id: Number(userId) },
    select: { permissionsVersion: true },
  })

  const permissionsVersion = user?.permissionsVersion ?? null
  cache.set(userId, {
    permissionsVersion,
    expiresAt: now + 30_000,
  })

  return permissionsVersion
}

function clearSessionCookies(response: NextResponse) {
  const cookieNames = [
    'next-auth.session-token',
    '__Secure-next-auth.session-token',
    'authjs.session-token',
    '__Secure-authjs.session-token',
  ]

  for (const cookieName of cookieNames) {
    response.cookies.set(cookieName, '', {
      expires: new Date(0),
      path: '/',
    })
  }
}

export default withAuth(
  async function proxy(req) {
    const token = req.nextauth.token

    if (token?.id) {
      const currentPermissionsVersion = await getCurrentPermissionsVersion(String(token.id))
      const tokenPermissionsVersion = typeof token.permissionsVersion === 'number'
        ? token.permissionsVersion
        : null

      if (currentPermissionsVersion !== tokenPermissionsVersion) {
        const response = NextResponse.redirect(new URL('/login?reason=role_changed', req.url))
        clearSessionCookies(response)
        return response
      }
    }

    // If authenticated user tries to access /login, redirect to dashboard
    if (req.nextUrl.pathname === '/login' && token) {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized({ token, req }) {
        const { pathname } = req.nextUrl

        if (pathname.startsWith('/dashboard')) {
          if (!token) return false

          const permissions = Array.isArray(token.permissions) ? token.permissions : []
          const requiredPermissions = getRequiredPermissionsForDashboardPath(pathname) ?? []

          return hasAnyPermission(permissions, requiredPermissions)
        }

        return true
      },
    },
    pages: {
      signIn: '/login',
    },
  }
)

export const config = {
  // Protect dashboard routes and handle login redirect
  matcher: ['/dashboard/:path*', '/login'],
}
