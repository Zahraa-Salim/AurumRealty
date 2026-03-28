/**
 * app/api/properties/route.ts
 *
 * GET  /api/properties          — fetch all published properties (public site)
 * GET  /api/properties?all=true — fetch all including drafts (dashboard)
 * POST /api/properties          — create a new property (dashboard)
 */

import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { requireApiPermissions } from '@/lib/api-auth'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const all = searchParams.get('all') === 'true'

    if (all) {
      const auth = await requireApiPermissions(['properties.view'])
      if (auth.response) return auth.response
    }

    const properties = await prisma.property.findMany({
      where: all ? {} : { isPublished: true },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(properties)
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch properties' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireApiPermissions(['properties.create'])
  if (auth.response) return auth.response

  try {
    const body = await request.json()
    const createData: Prisma.PropertyUncheckedCreateInput = {
      title: body.title,
      price: body.price,
      address: body.address,
      neighbourhood: body.neighbourhood,
      status: body.status,
      type: body.type,
      bedrooms: Number(body.bedrooms) || 0,
      bathrooms: Number(body.bathrooms) || 0,
      area: body.area,
      yearBuilt: body.yearBuilt,
      lotSize: body.lotSize,
      description: body.description,
      features: body.features || [],
      titleAr: body.titleAr,
      descriptionAr: body.descriptionAr,
      featuresAr: body.featuresAr || [],
      images: body.images || [],
      agentName: body.agentName,
      isPublished: body.isPublished || false,
      listingExpiresAt: body.listingExpiresAt ? new Date(body.listingExpiresAt) : null,
    }

    const property = await prisma.property.create({
      data: createData,
    })

    return NextResponse.json(property, { status: 201 })
  } catch {
    return NextResponse.json(
      { error: 'Failed to create property' },
      { status: 500 }
    )
  }
}
