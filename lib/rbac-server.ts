import 'server-only'

import { prisma } from '@/lib/prisma'
import { RBAC_PERMISSIONS, SYSTEM_ROLE_TEMPLATES } from '@/lib/rbac'

const globalForRbac = globalThis as unknown as {
  rbacBootstrapPromise?: Promise<void>
}

const LEGACY_ROLE_MAP: Record<string, string> = {
  Admin: 'Super Admin',
  'Super Admin': 'Super Admin',
  Editor: 'Editor',
  'Property Manager': 'Property Manager',
  Support: 'Support',
}

type PermissionRecord = {
  id: number
  key: string
}

type RoleRecord = {
  id: number
  name: string
}

export type AssignedRoleWithPermissions = {
  id: number
  name: string
  description: string | null
  isSystem: boolean
  createdAt: Date
  updatedAt: Date
  rolePermissions: Array<{
    roleId: number
    permissionId: number
    permission: {
      id: number
      key: string
      label: string
      description: string | null
      group: string
      createdAt: Date
      updatedAt: Date
    }
  }>
}

export type UserWithPermissions = {
  id: number
  name: string
  email: string
  password: string
  role: string
  roleId: number | null
  permissionsVersion: number
  isActive: boolean
  createdAt: Date
  lastActive: Date | null
  assignedRole: AssignedRoleWithPermissions | null
}

export async function ensureRbacConfigured() {
  if (!globalForRbac.rbacBootstrapPromise) {
    globalForRbac.rbacBootstrapPromise = bootstrapRbac()
  }

  await globalForRbac.rbacBootstrapPromise
}

async function bootstrapRbac() {
  for (const permission of RBAC_PERMISSIONS) {
    await prisma.permission.upsert({
      where: { key: permission.key },
      update: {
        label: permission.label,
        description: permission.description,
        group: permission.group,
      },
      create: permission,
    })
  }

  const allPermissions = await prisma.permission.findMany({
    select: { id: true, key: true },
  })
  const permissionMap = new Map(
    allPermissions.map((permission: PermissionRecord) => [permission.key, permission.id])
  )

  for (const template of SYSTEM_ROLE_TEMPLATES) {
    const role = await prisma.role.upsert({
      where: { name: template.name },
      update: {
        description: template.description,
        isSystem: template.isSystem,
      },
      create: {
        name: template.name,
        description: template.description,
        isSystem: template.isSystem,
      },
    })

    const permissionIds = template.permissionKeys
      .map(key => permissionMap.get(key))
      .filter((id): id is number => typeof id === 'number')

    await prisma.rolePermission.deleteMany({ where: { roleId: role.id } })

    if (permissionIds.length > 0) {
      await prisma.rolePermission.createMany({
        data: permissionIds.map(permissionId => ({ roleId: role.id, permissionId })),
        skipDuplicates: true,
      })
    }
  }

  const roles = await prisma.role.findMany({
    select: { id: true, name: true },
  })
  const roleMap = new Map(roles.map((role: RoleRecord) => [role.name, role.id]))

  const users = await prisma.user.findMany({
    select: { id: true, role: true, roleId: true },
  })

  for (const user of users) {
    const resolvedRoleName = LEGACY_ROLE_MAP[user.role] ?? user.role ?? 'Editor'
    const resolvedRoleId = roleMap.get(resolvedRoleName) ?? roleMap.get('Editor')

    if (!resolvedRoleId) continue

    if (user.roleId !== resolvedRoleId || user.role !== resolvedRoleName) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          role: resolvedRoleName,
          roleId: resolvedRoleId,
          permissionsVersion: {
            increment: 1,
          },
        },
      })
    }
  }
}

export async function getUserWithPermissionsByEmail(email: string): Promise<UserWithPermissions | null> {
  await ensureRbacConfigured()

  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      assignedRole: {
        include: {
          rolePermissions: {
            include: {
              permission: true,
            },
          },
        },
      },
    },
  })

  return user as UserWithPermissions | null
}

export function extractPermissionKeys(role: AssignedRoleWithPermissions | null | undefined) {
  return role?.rolePermissions.map(item => item.permission.key) ?? []
}

export function getAssignedRoleName(
  user: Pick<UserWithPermissions, 'role' | 'assignedRole'>,
) {
  return user.assignedRole ? user.assignedRole.name : user.role
}
