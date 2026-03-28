import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireApiPermissions } from '@/lib/api-auth'
import { ensureRbacConfigured } from '@/lib/rbac-server'

export const runtime = 'nodejs'

type PermissionSummary = {
  id: number
  key: string
}

type RoleDetail = {
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

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireApiPermissions(['roles.edit'])
  if (auth.response) return auth.response

  try {
    await ensureRbacConfigured()
    const { id } = await params
    const roleId = Number(id)
    const body = await request.json()

    const existingRole = await prisma.role.findUnique({
      where: { id: roleId },
      select: { id: true, isSystem: true },
    })

    if (!existingRole) {
      return NextResponse.json({ error: 'Role not found' }, { status: 404 })
    }

    if (existingRole.isSystem) {
      return NextResponse.json({ error: 'System roles cannot be edited here' }, { status: 400 })
    }

    const permissions = await prisma.permission.findMany({
      where: { key: { in: Array.isArray(body.permissionKeys) ? body.permissionKeys : [] } },
      select: { id: true, key: true },
    })

    await prisma.role.update({
      where: { id: roleId },
      data: {
        name: body.name,
        description: body.description || null,
      },
    })

    await prisma.rolePermission.deleteMany({ where: { roleId } })
    if (permissions.length > 0) {
      await prisma.rolePermission.createMany({
        data: permissions.map((permission: PermissionSummary) => ({
          roleId,
          permissionId: permission.id,
        })),
        skipDuplicates: true,
      })
    }

    const role = await prisma.role.findUnique({
      where: { id: roleId },
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

    return NextResponse.json({
      id: role?.id,
      name: role?.name,
      description: role?.description,
      isSystem: role?.isSystem,
      permissionKeys: role?.rolePermissions.map((item: RoleDetail['rolePermissions'][number]) => item.permission.key) ?? [],
      usersCount: role?._count.users ?? 0,
    })
  } catch (error) {
    console.error('PATCH /api/roles/[id] error:', error)
    return NextResponse.json({ error: 'Failed to update role' }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireApiPermissions(['roles.delete'])
  if (auth.response) return auth.response

  try {
    await ensureRbacConfigured()
    const { id } = await params
    const roleId = Number(id)

    const role = await prisma.role.findUnique({
      where: { id: roleId },
      include: {
        _count: {
          select: {
            users: true,
          },
        },
      },
    })

    if (!role) {
      return NextResponse.json({ error: 'Role not found' }, { status: 404 })
    }

    if (role.isSystem) {
      return NextResponse.json({ error: 'System roles cannot be deleted' }, { status: 400 })
    }

    if (role._count.users > 0) {
      return NextResponse.json({ error: 'Reassign users before deleting this role' }, { status: 400 })
    }

    await prisma.role.delete({ where: { id: roleId } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE /api/roles/[id] error:', error)
    return NextResponse.json({ error: 'Failed to delete role' }, { status: 500 })
  }
}
