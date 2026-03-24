import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireApiPermissions } from '@/lib/api-auth'

// PATCH /api/showings/[id]  — update status
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
    const showing = await prisma.showing.update({
      where: { id: numId },
      data: {
        ...(body.status !== undefined && { status: body.status }),
      },
    })
    return NextResponse.json(showing)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/showings/[id]
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

    await prisma.showing.delete({ where: { id: numId } })
    return NextResponse.json({ success: true })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
