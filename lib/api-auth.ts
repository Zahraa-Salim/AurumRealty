import 'server-only'

import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import { authOptions } from '@/lib/auth'
import { hasAnyPermission } from '@/lib/rbac'
import { ensureRbacConfigured } from '@/lib/rbac-server'

export async function requireApiPermissions(required: string[] = []) {
  await ensureRbacConfigured()

  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return {
      response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
      session: null,
    }
  }

  const permissions = session.user.permissions ?? []
  if (!hasAnyPermission(permissions, required)) {
    return {
      response: NextResponse.json({ error: 'Forbidden' }, { status: 403 }),
      session: null,
    }
  }

  return { response: null, session }
}
