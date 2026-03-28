import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireApiPermissions } from '@/lib/api-auth'

function parseId(id: string) {
  const numericId = Number(id)
  return Number.isInteger(numericId) && numericId > 0 ? numericId : null
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireApiPermissions(['news.view'])
  if (auth.response) return auth.response

  try {
    const { id } = await params
    const numericId = parseId(id)

    if (!numericId) {
      return NextResponse.json({ error: 'Invalid article ID' }, { status: 400 })
    }

    const article = await prisma.newsArticle.findUnique({ where: { id: numericId } })

    if (!article) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 })
    }

    return NextResponse.json(article)
  } catch (error) {
    console.error('GET /api/news/[id] error:', error)
    return NextResponse.json({ error: 'Failed to fetch article' }, { status: 500 })
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireApiPermissions(['news.edit'])
  if (auth.response) return auth.response

  try {
    const { id } = await params
    const numericId = parseId(id)

    if (!numericId) {
      return NextResponse.json({ error: 'Invalid article ID' }, { status: 400 })
    }

    const body = await req.json()
    const article = await prisma.newsArticle.update({
      where: { id: numericId },
      data: {
        ...(body.title !== undefined && { title: body.title }),
        ...(body.slug !== undefined && { slug: body.slug }),
        ...(body.category !== undefined && { category: body.category }),
        ...(body.author !== undefined && { author: body.author }),
        ...(body.summary !== undefined && { summary: body.summary }),
        ...(body.body !== undefined && { body: body.body }),
        ...(body.heroImage !== undefined && { heroImage: body.heroImage }),
        ...(body.titleAr !== undefined && { titleAr: body.titleAr }),
        ...(body.summaryAr !== undefined && { summaryAr: body.summaryAr }),
        ...(body.bodyAr !== undefined && { bodyAr: body.bodyAr }),
        ...(body.isPublished !== undefined && { isPublished: body.isPublished }),
        ...(body.publishedAt !== undefined && {
          publishedAt: body.publishedAt ? new Date(body.publishedAt) : null,
        }),
      },
    })

    return NextResponse.json(article)
  } catch (error) {
    console.error('PATCH /api/news/[id] error:', error)
    return NextResponse.json({ error: 'Failed to update article' }, { status: 500 })
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireApiPermissions(['news.delete'])
  if (auth.response) return auth.response

  try {
    const { id } = await params
    const numericId = parseId(id)

    if (!numericId) {
      return NextResponse.json({ error: 'Invalid article ID' }, { status: 400 })
    }

    await prisma.newsArticle.delete({ where: { id: numericId } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE /api/news/[id] error:', error)
    return NextResponse.json({ error: 'Failed to delete article' }, { status: 500 })
  }
}
