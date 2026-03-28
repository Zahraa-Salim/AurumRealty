import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireApiPermissions } from '@/lib/api-auth'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  const auth = await requireApiPermissions(['settings.view', 'pages.edit'])
  if (auth.response) return auth.response

  try {
    const { searchParams } = new URL(request.url)
    const key = searchParams.get('key')
    if (key) {
      const content = await prisma.siteContent.findUnique({ where: { key } })
      return NextResponse.json(content)
    }
    const all = await prisma.siteContent.findMany()
    return NextResponse.json(all)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch site content' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  const auth = await requireApiPermissions(['settings.edit', 'pages.edit'])
  if (auth.response) return auth.response

  try {
    const { searchParams } = new URL(request.url)
    const key = searchParams.get('key')
    if (!key) {
      return NextResponse.json({ error: 'key query parameter is required' }, { status: 400 })
    }
    await prisma.siteContent.delete({ where: { key } })
    return NextResponse.json({ deleted: key })
  } catch {
    return NextResponse.json({ error: 'Failed to delete site content' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireApiPermissions(['settings.edit', 'pages.edit'])
  if (auth.response) return auth.response

  try {
    const body = await request.json()
    const entries = Array.isArray(body) ? body : [body]

    const saved = await Promise.all(
      entries.map((entry) =>
        prisma.siteContent.upsert({
          where: { key: entry.key },
          update: {
            title: entry.title ?? null,
            subtitle: entry.subtitle ?? null,
            body: entry.body ?? null,
            image: entry.image ?? null,
            linkText: entry.linkText ?? null,
            linkUrl: entry.linkUrl ?? null,
          },
          create: {
            key: entry.key,
            title: entry.title ?? null,
            subtitle: entry.subtitle ?? null,
            body: entry.body ?? null,
            image: entry.image ?? null,
            linkText: entry.linkText ?? null,
            linkUrl: entry.linkUrl ?? null,
          },
        })
      )
    )

    return NextResponse.json(Array.isArray(body) ? saved : saved[0])
  } catch {
    return NextResponse.json({ error: 'Failed to update site content' }, { status: 500 })
  }
}
