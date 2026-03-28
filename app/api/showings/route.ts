/**
 * app/api/showings/route.ts
 *
 * GET  /api/showings  — fetch showings (scoped by permission)
 * POST /api/showings  — submit from property detail page (public)
 *
 * Permission logic:
 *   submissions.view      → all showings
 *   submissions.view.own  → only showings assignedToId === session.user.id
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireApiPermissions } from '@/lib/api-auth'
import { hasAnyPermission } from '@/lib/rbac'
import { sendShowingNotification } from '@/lib/notifications'

export async function GET(request: NextRequest) {
  const auth = await requireApiPermissions(['submissions.view', 'submissions.view.own'])
  if (auth.response) return auth.response

  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const permissions = auth.session?.user?.permissions ?? []
    const userId = auth.session?.user?.id ? Number(auth.session.user.id) : null

    // Scoped: only own assignments — applies when user lacks the full submissions.view
    const ownOnly =
      !hasAnyPermission(permissions, ['submissions.view']) &&
      hasAnyPermission(permissions, ['submissions.view.own'])

    const whereClause = {
      ...(type ? { type } : {}),
      ...(ownOnly && userId
        ? { OR: [{ assignedToId: userId }, { assignedToId: null }] }
        : {}),
    }

    const showings = await prisma.showing.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      include: {
        property: { select: { title: true } },
        assignedTo: { select: { id: true, name: true } },
      },
    })

    return NextResponse.json(showings)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch showings' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    if (!body.name || !body.email) {
      return NextResponse.json({ error: 'Name and email are required' }, { status: 400 })
    }

    // Auto-assign: if a property has an agentName, find the matching user
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

    const showing = await prisma.showing.create({
      data: {
        type:         body.type || 'showing',
        propertyId:   body.propertyId ? Number(body.propertyId) : null,
        propertyName: body.propertyName || '',
        name:         body.name,
        email:        body.email,
        phone:        body.phone || null,
        date:         body.date  || null,
        time:         body.time  || null,
        message:      body.message || '',
        status:       'New',
        assignedToId,
      },
    })

    await sendShowingNotification({
      type: showing.type,
      propertyName: showing.propertyName,
      name: showing.name,
      email: showing.email,
      phone: showing.phone,
      date: showing.date,
      time: showing.time,
      message: showing.message,
    })

    return NextResponse.json(showing, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Failed to submit showing request' }, { status: 500 })
  }
}
