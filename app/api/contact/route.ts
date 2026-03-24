/**
 * app/api/contact/route.ts
 *
 * GET  /api/contact  — fetch all messages (dashboard)
 * POST /api/contact  — submit contact form (public site)
 *
 * PATCH /api/contact/:id and DELETE /api/contact/:id
 * are handled in app/api/contact/[id]/route.ts
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireApiPermissions } from '@/lib/api-auth'
import { sendContactNotification } from '@/lib/notifications'

export async function GET() {
  const auth = await requireApiPermissions(['submissions.view'])
  if (auth.response) return auth.response

  try {
    const messages = await prisma.contactMessage.findMany({
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(messages)
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    )
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

    const message = await prisma.contactMessage.create({
      data: {
        name:    body.name,
        email:   body.email,
        phone:   body.phone || null,
        message: body.message,
        status:  'Unread',
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
    return NextResponse.json(
      { error: 'Failed to submit message' },
      { status: 500 }
    )
  }
}
