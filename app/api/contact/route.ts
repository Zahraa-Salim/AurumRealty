/**
 * app/api/contact/route.ts
 *
 * GET  /api/contact  — fetch messages (scoped by permission)
 * POST /api/contact  — submit contact form (public site)
 *
 * Permission logic:
 *   submissions.view      → all messages
 *   submissions.view.own  → only messages assignedToId === session.user.id
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireApiPermissions } from '@/lib/api-auth'
import { hasAnyPermission } from '@/lib/rbac'

export const runtime = 'nodejs'
import { sendContactNotification } from '@/lib/notifications'

export async function GET() {
  const auth = await requireApiPermissions(['submissions.view', 'submissions.view.own'])
  if (auth.response) return auth.response

  try {
    const permissions = auth.session?.user?.permissions ?? []
    const userId = auth.session?.user?.id ? Number(auth.session.user.id) : null

    const ownOnly =
      !hasAnyPermission(permissions, ['submissions.view']) &&
      hasAnyPermission(permissions, ['submissions.view.own'])

    const whereClause = ownOnly && userId
      ? { OR: [{ assignedToId: userId }, { assignedToId: null }] }
      : {}

    const messages = await prisma.contactMessage.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      include: { assignedTo: { select: { id: true, name: true } } },
    })

    return NextResponse.json(messages)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    if (!body.name || !body.email || !body.message) {
      return NextResponse.json(
        { error: 'Name, email and message are required' },
        { status: 400 }
      )
    }

    // Auto-assign if a propertyId is provided (agent enquiry from property page)
    let assignedToId: number | null = null
    if (body.propertyId) {
      const property = await prisma.property.findUnique({
        where: { id: Number(body.propertyId) },
        select: { agentName: true },
      })
      if (property?.agentName) {
        const agentUser = await prisma.user.findFirst({
          where: {
            name: { equals: property.agentName, mode: 'insensitive' },
            isActive: true,
          },
          select: { id: true },
        })
        if (agentUser) assignedToId = agentUser.id
      }
    }

    const message = await prisma.contactMessage.create({
      data: {
        name:    body.name,
        email:   body.email,
        phone:   body.phone || null,
        message: body.message,
        status:  'Unread',
        assignedToId,
      },
    })

    await sendContactNotification({
      name: message.name,
      email: message.email,
      phone: message.phone,
      message: message.message,
    })

    return NextResponse.json(message, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Failed to submit message' }, { status: 500 })
  }
}
