/**
 * NewsDetailPage — /news/[slug]
 * Fetches article from DB by slug. 404 if not found.
 * Related = 3 most recent other published articles.
 */

import React from 'react'
import Link from 'next/link'
import type { NewsArticle } from '@prisma/client'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'

export const revalidate = 60

type RelatedNewsArticle = Pick<
  NewsArticle,
  'slug' | 'title' | 'category' | 'heroImage' | 'publishedAt'
>

const categoryColors: Record<string, string> = {
  'Company news': 'bg-charcoal text-white',
  'Market update': 'bg-gold/10 text-charcoal border border-gold/40',
  'Awards': 'bg-cream text-charcoal border border-light-gray',
  'Industry insight': 'bg-light-gray/40 text-charcoal',
  'Transaction': 'bg-success/10 text-success',
}

export async function generateStaticParams() {
  try {
    const articles = await prisma.newsArticle.findMany({
      where: { isPublished: true },
      select: { slug: true },
    })
    return articles.map((a) => ({ slug: a.slug }))
  } catch {
    return []
  }
}

export default async function NewsDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params // ✅ FIXED

  let article: NewsArticle | null = null
  let related: RelatedNewsArticle[] = []

  try {
    // ✅ FIXED: findUnique only uses unique field
    article = await prisma.newsArticle.findUnique({
      where: { slug },
    })

    // ✅ FIXED: check isPublished separately
    if (!article || !article.isPublished) notFound()

    related = await prisma.newsArticle.findMany({
      where: {
        isPublished: true,
        slug: { not: slug }, // ✅ FIXED
      },
      orderBy: { publishedAt: 'desc' },
      take: 3,
      select: {
        slug: true,
        title: true,
        category: true,
        heroImage: true,
        publishedAt: true,
      },
    })
  } catch {
    notFound()
  }

  if (!article) {
    notFound()
  }

  const fmt = (d: Date | string | null) =>
    d
      ? new Date(d).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      : ''

  const paras = (article.body || '').split('\n\n').filter(Boolean)

  return (
    <main className="w-full bg-white pb-24">
      {/* HERO */}
      <div className="w-full h-[45vh] relative overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={
            article.heroImage ??
            'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1920&q=80'
          }
          alt={article.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-charcoal/30" />
        <div className="absolute bottom-8 left-4 md:left-8 right-4 md:right-8 max-w-[1200px] mx-auto">
          <span
            className={`inline-block font-sans text-[12px] font-medium px-3 py-1 rounded-full mb-3 ${
              categoryColors[article.category] ??
              'bg-cream text-charcoal'
            }`}
          >
            {article.category}
          </span>

          <h1 className="font-serif text-[28px] md:text-[40px] text-white leading-[1.2]">
            {article.title}
          </h1>
        </div>
      </div>

      {/* CONTENT */}
      <article className="max-w-[740px] mx-auto px-4 md:px-8 py-12">
        <div
          className="flex items-center gap-4 pb-8 border-b border-light-gray mb-8 text-taupe"
          style={{ borderWidth: '0 0 0.5px 0' }}
        >
          <Link
            href="/news"
            className="font-sans text-[13px] hover:text-charcoal no-underline transition-colors"
          >
            ← News
          </Link>

          <span className="text-light-gray">·</span>
          <span className="font-sans text-[13px]">
            {article.author}
          </span>

          <span className="text-light-gray">·</span>
          <span className="font-sans text-[13px]">
            {fmt(article.publishedAt)}
          </span>
        </div>

        {article.summary && (
          <p className="font-sans text-[16px] text-taupe italic leading-[1.7] mb-8 pl-5 border-l-[3px] border-gold">
            {article.summary}
          </p>
        )}

        <div className="space-y-6">
          {paras.map((para: string, i: number) =>
            para.startsWith('## ') ? (
              <h2
                key={i}
                className="font-serif text-[22px] text-charcoal leading-[1.3] mt-10 mb-2"
              >
                {para.replace('## ', '')}
              </h2>
            ) : (
              <p
                key={i}
                className="font-sans text-[15px] text-taupe leading-[1.8]"
              >
                {para}
              </p>
            )
          )}
        </div>

        {/* CTA */}
        <div
          className="mt-12 pt-8 border-t border-light-gray"
          style={{ borderWidth: '0.5px 0 0 0' }}
        >
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 font-sans text-[14px] font-medium text-charcoal hover:text-taupe transition-colors no-underline"
          >
            Contact our team
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m9 18 6-6-6-6" />
            </svg>
          </Link>
        </div>
      </article>

      {/* RELATED */}
      {related.length > 0 && (
        <section
          className="py-12 px-4 md:px-8 border-t border-light-gray max-w-[1200px] mx-auto"
          style={{ borderWidth: '0.5px 0 0 0' }}
        >
          <h2 className="font-serif text-[24px] text-charcoal mb-8">
            More news
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {related.map((r) => (
              <Link
                key={r.slug}
                href={`/news/${r.slug}`}
                className="block group no-underline"
              >
                <div className="overflow-hidden rounded-sm mb-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={
                      r.heroImage ??
                      'https://images.unsplash.com/photo-1449844908441-8829872d2607?w=800&q=80'
                    }
                    alt={r.title}
                    className="w-full h-[160px] object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>

                <span
                  className={`inline-block font-sans text-[11px] font-medium px-2.5 py-1 rounded-full mb-2 ${
                    categoryColors[r.category] ??
                    'bg-cream text-charcoal'
                  }`}
                >
                  {r.category}
                </span>

                <h3 className="font-serif text-[16px] text-charcoal leading-[1.3] group-hover:text-taupe transition-colors">
                  {r.title}
                </h3>

                <p className="font-sans text-[12px] text-mid-gray mt-2">
                  {fmt(r.publishedAt)}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </main>
  )
}
