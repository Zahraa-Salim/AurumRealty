import bcrypt from 'bcryptjs'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireApiPermissions } from '@/lib/api-auth'
import { ensureRbacConfigured } from '@/lib/rbac-server'

export const runtime = 'nodejs'

type UserListItem = {
  id: number
  name: string
  email: string
  role: string
  roleId: number | null
  isActive: boolean
  createdAt: Date
  lastActive: Date | null
  assignedRole: {
    id: number
    name: string
  } | null
}

export async function GET() {
  const auth = await requireApiPermissions(['users.view'])
  if (auth.response) return auth.response

  try {
    await ensureRbacConfigured()

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        roleId: true,
        isActive: true,
        createdAt: true,
        lastActive: true,
        assignedRole: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    })

    return NextResponse.json(
      users.map((user: UserListItem) => ({
        ...user,
        roleName: user.assignedRole?.name ?? user.role,
      }))
    )
  } catch (error) {
    console.error('GET /api/users error:', error)
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  const auth = await requireApiPermissions(['users.edit'])
  if (auth.response) return auth.response

  try {
    await ensureRbacConfigured()
    const body = await request.json()

    if (!body.id) {
      return NextResponse.json({ error: 'User id is required' }, { status: 400 })
    }

    let roleData: { roleId?: number | null; role?: string } = {}

    if (body.roleId !== undefined) {
      const role = await prisma.role.findUnique({
        where: { id: Number(body.roleId) },
        select: { id: true, name: true },
      })

      if (!role) {
        return NextResponse.json({ error: 'Selected role not found' }, { status: 404 })
      }

      roleData = { roleId: role.id, role: role.name }
    }

    const user = await prisma.user.update({
      where: { id: Number(body.id) },
      data: {
        ...(body.name !== undefined && { name: body.name }),
        ...(body.isActive !== undefined && { isActive: Boolean(body.isActive) }),
        ...roleData,
        ...(body.roleId !== undefined && {
          permissionsVersion: {
            increment: 1,
          },
        }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        roleId: true,
        isActive: true,
        createdAt: true,
        lastActive: true,
        assignedRole: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    return NextResponse.json({
      ...user,
      roleName: user.assignedRole?.name ?? user.role,
    })
  } catch (error) {
    console.error('PATCH /api/users error:', error)
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireApiPermissions(['users.create'])
  if (auth.response) return auth.response

  try {
    await ensureRbacConfigured()
    const body = await request.json()

    if (!body.email || !body.roleId || !body.password) {
      return NextResponse.json(
        { error: 'Email, role and temporary password are required' },
        { status: 400 }
      )
    }

    const role = await prisma.role.findUnique({
      where: { id: Number(body.roleId) },
      select: { id: true, name: true },
    })

    if (!role) {
      return NextResponse.json({ error: 'Selected role not found' }, { status: 404 })
    }

    const password = String(body.password)
    if (password.length < 8) {
      return NextResponse.json({ error: 'Temporary password must be at least 8 characters' }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    const user = await prisma.user.create({
      data: {
        name: body.name || body.email.split('@')[0],
        email: String(body.email).toLowerCase(),
        password: hashedPassword,
        role: role.name,
        roleId: role.id,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        roleId: true,
        isActive: true,
        createdAt: true,
        lastActive: true,
        assignedRole: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    return NextResponse.json(
      {
        ...user,
        roleName: user.assignedRole?.name ?? user.role,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('POST /api/users error:', error)
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 })
  }
}
