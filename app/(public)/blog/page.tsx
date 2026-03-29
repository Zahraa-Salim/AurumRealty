/**
 * BlogPage — /blog
 * Fetches posts from DB via Prisma. Server component — no client state needed for data.
 * Client-side topic filter uses 'use client' wrapper component below.
 */
import React from 'react'
import type { BlogPost } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { getServerLocale } from '@/lib/locale-server'
import { localise, type Locale } from '@/lib/i18n'
import BlogClientFilter from './BlogClientFilter'

export const revalidate = 60

type BlogListPost = Pick<
  BlogPost,
  'id' | 'slug' | 'title' | 'titleAr' | 'topic' | 'author' | 'subtitle' | 'subtitleAr' | 'heroImage' | 'readTime' | 'publishedAt'
>

export default async function BlogPage() {
  const locale = (await getServerLocale()) as Locale
  let posts: BlogListPost[] = []

  try {
    posts = await prisma.blogPost.findMany({
      where: { isPublished: true },
      orderBy: { publishedAt: 'desc' },
      select: {
        id: true,
        slug: true,
        title: true,
        titleAr: true,
        topic: true,
        author: true,
        subtitle: true,
        subtitleAr: true,
        heroImage: true,
        readTime: true,
        publishedAt: true,
      },
    })
  } catch (error) {
    console.error('Failed to fetch blog posts:', error)
  }

  // In Arabic mode, only show posts that have an Arabic translation
  if (locale === 'ar') {
    posts = posts.filter(p => p.titleAr && p.titleAr.trim())
  }

  return (
    <main className="w-full bg-white min-h-screen pb-24">
      <section className="bg-cream py-16 px-4 md:px-8">
        <div className="max-w-[1200px] mx-auto">
          <h1 className="font-serif text-[40px] md:text-[48px] text-charcoal leading-[1.1] mb-4">
            {locale === 'ar' ? 'مجلة أوروم ريالتي' : 'The Aurum Realty Journal'}
          </h1>
          <p className="font-sans text-[16px] text-taupe">
            {locale === 'ar'
              ? 'رؤى سوقية وأدلة استثمار ووجهات نظر صناعية'
              : 'Market insights, investment guides and industry perspectives'}
          </p>
        </div>
      </section>

      {posts.length === 0 ? (
        <div className="text-center py-24 px-4">
          <p className="font-serif text-[24px] text-charcoal mb-3">
            {locale === 'ar' ? 'لا توجد منشورات حتى الآن' : 'No posts yet'}
          </p>
          <p className="font-sans text-[14px] text-taupe">
            {locale === 'ar'
              ? 'تحقق من جديد قريباً للمقالات من فريقنا.'
              : 'Check back soon for articles from our team.'}
          </p>
        </div>
      ) : (
        <BlogClientFilter posts={posts} locale={locale} />
      )}
    </main>
  )
}
