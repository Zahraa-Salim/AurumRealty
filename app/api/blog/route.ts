/**
 * app/api/blog/route.ts
 *
 * GET  /api/blog          — fetch all published posts (public site)
 * GET  /api/blog?all=true — fetch all including drafts (dashboard)
 * POST /api/blog          — create a new post (dashboard)
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireApiPermissions } from '@/lib/api-auth'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const all   = searchParams.get('all') === 'true'
    const topic = searchParams.get('topic')

    if (all) {
      const auth = await requireApiPermissions(['blog.view'])
      if (auth.response) return auth.response
    }

    const posts = await prisma.blogPost.findMany({
      where: {
        ...(all ? {} : { isPublished: true }),
        ...(topic ? { topic } : {}),
      },
      orderBy: { publishedAt: 'desc' },
    })

    return NextResponse.json(posts)
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch blog posts' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireApiPermissions(['blog.create'])
  if (auth.response) return auth.response

  try {
    const body = await request.json()

    const post = await prisma.blogPost.create({
      data: {
        title:       body.title,
        slug:        body.slug,
        topic:       body.topic,
        author:      body.author,
        subtitle:    body.subtitle,
        body:        body.body,
        pullQuote:   body.pullQuote,
        heroImage:   body.heroImage,
        readTime:    body.readTime,
        titleAr:     body.titleAr,
        subtitleAr:  body.subtitleAr,
        bodyAr:      body.bodyAr,
        pullQuoteAr: body.pullQuoteAr,
        isPublished: body.isPublished || false,
        publishedAt: body.isPublished ? new Date() : null,
      },
    })

    return NextResponse.json(post, { status: 201 })
  } catch {
    return NextResponse.json(
      { error: 'Failed to create blog post' },
      { status: 500 }
    )
  }
}
