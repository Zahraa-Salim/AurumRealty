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
  const auth = await requireApiPermissions(['blog.view'])
  if (auth.response) return auth.response

  try {
    const { id } = await params
    const numericId = parseId(id)

    if (!numericId) {
      return NextResponse.json({ error: 'Invalid post ID' }, { status: 400 })
    }

    const post = await prisma.blogPost.findUnique({ where: { id: numericId } })

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    return NextResponse.json(post)
  } catch (error) {
    console.error('GET /api/blog/[id] error:', error)
    return NextResponse.json({ error: 'Failed to fetch post' }, { status: 500 })
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireApiPermissions(['blog.edit'])
  if (auth.response) return auth.response

  try {
    const { id } = await params
    const numericId = parseId(id)

    if (!numericId) {
      return NextResponse.json({ error: 'Invalid post ID' }, { status: 400 })
    }

    const body = await req.json()
    const post = await prisma.blogPost.update({
      where: { id: numericId },
      data: {
        ...(body.title !== undefined && { title: body.title }),
        ...(body.slug !== undefined && { slug: body.slug }),
        ...(body.topic !== undefined && { topic: body.topic }),
        ...(body.author !== undefined && { author: body.author }),
        ...(body.subtitle !== undefined && { subtitle: body.subtitle }),
        ...(body.body !== undefined && { body: body.body }),
        ...(body.pullQuote !== undefined && { pullQuote: body.pullQuote }),
        ...(body.heroImage !== undefined && { heroImage: body.heroImage }),
        ...(body.readTime !== undefined && { readTime: body.readTime }),
        ...(body.isPublished !== undefined && { isPublished: body.isPublished }),
        ...(body.publishedAt !== undefined && {
          publishedAt: body.publishedAt ? new Date(body.publishedAt) : null,
        }),
      },
    })

    return NextResponse.json(post)
  } catch (error) {
    console.error('PATCH /api/blog/[id] error:', error)
    return NextResponse.json({ error: 'Failed to update post' }, { status: 500 })
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireApiPermissions(['blog.delete'])
  if (auth.response) return auth.response

  try {
    const { id } = await params
    const numericId = parseId(id)

    if (!numericId) {
      return NextResponse.json({ error: 'Invalid post ID' }, { status: 400 })
    }

    await prisma.blogPost.delete({ where: { id: numericId } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE /api/blog/[id] error:', error)
    return NextResponse.json({ error: 'Failed to delete post' }, { status: 500 })
  }
}
