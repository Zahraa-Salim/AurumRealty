/**
 * app/api/showings/route.ts
 *
 * GET  /api/showings           — fetch all showings (dashboard)
 * GET  /api/showings?type=showing|agent_enquiry — filter by type
 * POST /api/showings           — submit from property detail page
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireApiPermissions } from '@/lib/api-auth'
import { sendShowingNotification } from '@/lib/notifications'

export async function GET(request: NextRequest) {
  const auth = await requireApiPermissions(['submissions.view'])
  if (auth.response) return auth.response

  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')

    const showings = await prisma.showing.findMany({
      where: type ? { type } : {},
      orderBy: { createdAt: 'desc' },
      include: { property: { select: { title: true } } },
    })

    return NextResponse.json(showings)
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch showings' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    if (!body.name || !body.email) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      )
    }

    const showing = await prisma.showing.create({
      data: {
        type:         body.type || 'showing',  // 'showing' | 'agent_enquiry'
        propertyId:   body.propertyId ? Number(body.propertyId) : null,
        propertyName: body.propertyName || '',
        name:         body.name,
        email:        body.email,
        phone:        body.phone || null,
        date:         body.date  || null,
        time:         body.time  || null,
        message:      body.message || '',
        status:       'New',
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
    return NextResponse.json(
      { error: 'Failed to submit showing request' },
      { status: 500 }
    )
  }
}
