import bcrypt from 'bcryptjs'
import { NextRequest, NextResponse } from 'next/server'
import { requireApiPermissions } from '@/lib/api-auth'
import { prisma } from '@/lib/prisma'
import { hasAnyPermission } from '@/lib/rbac'

export const runtime = 'nodejs'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireApiPermissions([])
    if (auth.response) return auth.response

    const { id } = await params
    const sessionUserId = auth.session?.user?.id
    const permissions = auth.session?.user?.permissions ?? []

    if (!sessionUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (sessionUserId !== id && !hasAnyPermission(permissions, ['users.edit'])) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const currentPassword = String(body.currentPassword ?? '')
    const newPassword = String(body.newPassword ?? '')

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: 'Current password and new password are required.' },
        { status: 400 }
      )
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters.' },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: Number(id) },
      select: { id: true, password: true },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 })
    }

    const matches = await bcrypt.compare(currentPassword, user.password)
    if (!matches) {
      return NextResponse.json({ error: 'Current password is incorrect.' }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12)

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        permissionsVersion: {
          increment: 1,
        },
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('PATCH /api/users/[id]/password error:', error)
    return NextResponse.json({ error: 'Failed to update password.' }, { status: 500 })
  }
}
