/**
 * app/api/news/route.ts
 *
 * GET  /api/news             — fetch all published articles (public site)
 * GET  /api/news?all=true    — fetch all including drafts (dashboard)
 * GET  /api/news?category=X  — filter by category
 * POST /api/news             — create a new article (dashboard)
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireApiPermissions } from '@/lib/api-auth'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const all      = searchParams.get('all') === 'true'
    const category = searchParams.get('category')

    if (all) {
      const auth = await requireApiPermissions(['news.view'])
      if (auth.response) return auth.response
    }

    const articles = await prisma.newsArticle.findMany({
      where: {
        ...(all ? {} : { isPublished: true }),
        ...(category ? { category } : {}),
      },
      orderBy: { publishedAt: 'desc' },
    })

    return NextResponse.json(articles)
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch news articles' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireApiPermissions(['news.create'])
  if (auth.response) return auth.response

  try {
    const body = await request.json()

    const article = await prisma.newsArticle.create({
      data: {
        title:       body.title,
        slug:        body.slug,
        category:    body.category,
        author:      body.author,
        summary:     body.summary,
        body:        body.body,
        heroImage:   body.heroImage,
        titleAr:     body.titleAr,
        summaryAr:   body.summaryAr,
        bodyAr:      body.bodyAr,
        isPublished: body.isPublished || false,
        publishedAt: body.isPublished ? new Date() : null,
      },
    })

    return NextResponse.json(article, { status: 201 })
  } catch {
    return NextResponse.json(
      { error: 'Failed to create news article' },
      { status: 500 }
    )
  }
}
