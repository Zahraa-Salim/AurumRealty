/**
 * app/api/properties/[id]/route.ts
 *
 * GET    /api/properties/:id  — fetch single property
 * PATCH  /api/properties/:id  — update property (dashboard)
 * DELETE /api/properties/:id  — delete property (dashboard)
 */

import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { requireApiPermissions } from '@/lib/api-auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const numericId = Number(id)

    if (isNaN(numericId)) {
      return NextResponse.json({ error: 'Invalid property ID' }, { status: 400 })
    }

    const property = await prisma.property.findUnique({
      where: { id: numericId },
    })

    if (!property) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 })
    }

    return NextResponse.json(property)
  } catch (error) {
    console.error('GET /api/properties/[id] error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch property', detail: String(error) },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireApiPermissions(['properties.edit'])
  if (auth.response) return auth.response

  try {
    const { id } = await params
    const body = await request.json()
    const updateData: Prisma.PropertyUncheckedUpdateInput = {
      title: body.title,
      price: body.price,
      address: body.address,
      neighbourhood: body.neighbourhood,
      status: body.status,
      type: body.type,
      bedrooms: body.bedrooms !== undefined ? Number(body.bedrooms) : undefined,
      bathrooms: body.bathrooms !== undefined ? Number(body.bathrooms) : undefined,
      area: body.area,
      yearBuilt: body.yearBuilt,
      lotSize: body.lotSize,
      description: body.description,
      features: body.features,
      titleAr: body.titleAr,
      descriptionAr: body.descriptionAr,
      featuresAr: body.featuresAr,
      images: body.images,
      agentName: body.agentName,
      isPublished: body.isPublished,
      listingExpiresAt: body.listingExpiresAt ? new Date(body.listingExpiresAt) : null,
    }

    const property = await prisma.property.update({
      where: { id: Number(id) },
      data: updateData,
    })

    return NextResponse.json(property)
  } catch (error) {
    console.error('PATCH /api/properties/[id] error:', error)
    return NextResponse.json(
      { error: 'Failed to update property' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireApiPermissions(['properties.delete'])
  if (auth.response) return auth.response

  try {
    const { id } = await params
    await prisma.property.delete({
      where: { id: Number(id) },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE /api/properties/[id] error:', error)
    return NextResponse.json(
      { error: 'Failed to delete property' },
      { status: 500 }
    )
  }
}
