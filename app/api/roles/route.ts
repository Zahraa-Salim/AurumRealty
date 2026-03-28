import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireApiPermissions } from '@/lib/api-auth'
import { ensureRbacConfigured } from '@/lib/rbac-server'

export const runtime = 'nodejs'

type PermissionSummary = {
  id: number
  key: string
}

type RoleListItem = {
  id: number
  name: string
  description: string | null
  isSystem: boolean
  rolePermissions: Array<{
    permission: {
      key: string
    }
  }>
  _count: {
    users: number
  }
}

export async function GET() {
  const auth = await requireApiPermissions(['roles.view', 'users.edit', 'users.create'])
  if (auth.response) return auth.response

  try {
    await ensureRbacConfigured()

    const roles = await prisma.role.findMany({
      include: {
        rolePermissions: {
          include: {
            permission: true,
          },
        },
        _count: {
          select: {
            users: true,
          },
        },
      },
      orderBy: [{ isSystem: 'desc' }, { name: 'asc' }],
    })

    return NextResponse.json(
      roles.map((role: RoleListItem) => ({
        id: role.id,
        name: role.name,
        description: role.description,
        isSystem: role.isSystem,
        permissionKeys: role.rolePermissions.map((item: RoleListItem['rolePermissions'][number]) => item.permission.key),
        usersCount: role._count.users,
      }))
    )
  } catch (error) {
    console.error('GET /api/roles error:', error)
    return NextResponse.json({ error: 'Failed to fetch roles' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireApiPermissions(['roles.create'])
  if (auth.response) return auth.response

  try {
    await ensureRbacConfigured()
    const body = await request.json()

    if (!body.name || !Array.isArray(body.permissionKeys)) {
      return NextResponse.json({ error: 'Role name and permissions are required' }, { status: 400 })
    }

    const permissions = await prisma.permission.findMany({
      where: { key: { in: body.permissionKeys } },
      select: { id: true, key: true },
    })

    const role = await prisma.role.create({
      data: {
        name: body.name,
        description: body.description || null,
        isSystem: false,
        rolePermissions: {
          create: permissions.map((permission: PermissionSummary) => ({
            permissionId: permission.id,
          })),
        },
      },
      include: {
        rolePermissions: {
          include: {
            permission: true,
          },
        },
        _count: {
          select: {
            users: true,
          },
        },
      },
    })

    return NextResponse.json(
      {
        id: role.id,
        name: role.name,
        description: role.description,
        isSystem: role.isSystem,
        permissionKeys: role.rolePermissions.map((item: RoleListItem['rolePermissions'][number]) => item.permission.key),
        usersCount: role._count.users,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('POST /api/roles error:', error)
    return NextResponse.json({ error: 'Failed to create role' }, { status: 500 })
  }
}
