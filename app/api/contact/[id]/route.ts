import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireApiPermissions } from '@/lib/api-auth'

export const runtime = 'nodejs'

// PATCH /api/contact/[id]  — update status
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireApiPermissions(['submissions.update'])
  if (auth.response) return auth.response

  try {
    const { id } = await params
    const numId = parseInt(id, 10)
    if (isNaN(numId)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 })

    const body = await req.json()
    const message = await prisma.contactMessage.update({
      where: { id: numId },
      data: {
        ...(body.status !== undefined && { status: body.status }),
        ...(body.assignedToId !== undefined && { assignedToId: body.assignedToId ? Number(body.assignedToId) : null }),
      },
    })
    return NextResponse.json(message)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/contact/[id]
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireApiPermissions(['submissions.delete'])
  if (auth.response) return auth.response

  try {
    const { id } = await params
    const numId = parseInt(id, 10)
    if (isNaN(numId)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 })

    await prisma.contactMessage.delete({ where: { id: numId } })
    return NextResponse.json({ success: true })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
