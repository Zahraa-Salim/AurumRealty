/**
 * NewsPage — /news
 * Fetches articles from /api/news. Shows loading skeleton and error state.
 * Featured article (first result) shown as hero, rest as card grid.
 */
import React from 'react'
import Link from 'next/link'
import type { NewsArticle } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { getServerLocale } from '@/lib/locale-server'
import { localise, localiseLabel, CATEGORY_AR, type Locale } from '@/lib/i18n'

const categoryColors: Record<string, string> = {
  'Company news':    'bg-charcoal text-white',
  'Market update':   'bg-gold/10 text-charcoal border border-gold/40',
  'Awards':          'bg-cream text-charcoal border border-light-gray',
  'Industry insight':'bg-light-gray/40 text-charcoal',
  'Transaction':     'bg-success/10 text-success',
}

export const revalidate = 60 // revalidate every 60 seconds

type NewsListItem = Pick<
  NewsArticle,
  'id' | 'slug' | 'title' | 'titleAr' | 'category' | 'heroImage' | 'summary' | 'summaryAr' | 'author' | 'publishedAt'
>

export default async function NewsPage() {
  const locale = (await getServerLocale()) as Locale
  let newsItems: NewsListItem[] = []

  try {
    newsItems = await prisma.newsArticle.findMany({
      where: { isPublished: true },
      orderBy: { publishedAt: 'desc' },
      select: {
        id: true,
        slug: true,
        title: true,
        titleAr: true,
        category: true,
        heroImage: true,
        summary: true,
        summaryAr: true,
        author: true,
        publishedAt: true,
      },
    })
  } catch (error) {
    console.error('Failed to fetch news:', error)
  }

  // In Arabic mode, only show articles that have an Arabic translation
  if (locale === 'ar') {
    newsItems = newsItems.filter(a => a.titleAr && a.titleAr.trim())
  }

  const featured = newsItems[0]
  const rest     = newsItems.slice(1)

  return (
    <main className="w-full bg-white pb-24">
      <section className="bg-cream py-16 px-4 md:px-8">
        <div className="max-w-[1200px] mx-auto">
          <h1 className="font-serif text-[40px] md:text-[48px] text-charcoal leading-[1.1] mb-4">
            {locale === 'ar' ? 'الصحافة والأخبار' : 'Press & news'}
          </h1>
          <p className="font-sans text-[16px] text-taupe">
            {locale === 'ar'
              ? 'الإعلانات الشركات والتحديثات السوقية والاعتراف الصناعي'
              : 'Company announcements, market updates and industry recognition'}
          </p>
        </div>
      </section>

      {newsItems.length === 0 ? (
        <div className="text-center py-24 px-4">
          <p className="font-serif text-[24px] text-charcoal mb-3">
            {locale === 'ar' ? 'لا توجد مقالات حتى الآن' : 'No articles yet'}
          </p>
          <p className="font-sans text-[14px] text-taupe">
            {locale === 'ar' ? 'تحقق من جديد قريباً للحصول على أحدث الأخبار.' : 'Check back soon for the latest news.'}
          </p>
        </div>
      ) : (
        <>
          {/* Featured article */}
          {featured && (
            <section className="py-12 md:py-16 px-4 md:px-8 max-w-[1200px] mx-auto">
              <Link href={`/news/${featured.slug}`} className="block group no-underline">
                <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-center">
                  <div className="w-full md:w-1/2 overflow-hidden rounded-sm">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={featured.heroImage ?? 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1200&q=80'} alt={featured.title}
                      className="w-full h-[320px] object-cover transition-transform duration-500 group-hover:scale-105" />
                  </div>
                  <div className="w-full md:w-1/2">
                    <span className={`inline-block font-sans text-[12px] font-medium px-3 py-1 rounded-full mb-4 ${categoryColors[featured.category] ?? 'bg-cream text-charcoal'}`}>{localiseLabel(featured.category, CATEGORY_AR, locale)}</span>
                    <h2 className="font-serif text-[28px] md:text-[32px] text-charcoal leading-[1.2] mb-4 group-hover:text-taupe transition-colors">
                      {localise(featured.title, featured.titleAr, locale)}
                    </h2>
                    <p className="font-sans text-[15px] text-taupe leading-[1.7] mb-5">{localise(featured.summary, featured.summaryAr, locale)}</p>
                    <p className="font-sans text-[13px] text-mid-gray">
                      {featured.author} · {featured.publishedAt ? new Date(featured.publishedAt).toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US', { year:'numeric', month:'long', day:'numeric' }) : ''}
                    </p>
                  </div>
                </div>
              </Link>
            </section>
          )}

          {/* Article grid */}
          {rest.length > 0 && (
            <section className="py-8 px-4 md:px-8 max-w-[1200px] mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {rest.map((item) => (
                  <Link key={item.id} href={`/news/${item.slug}`} className="block group no-underline">
                    <div className="bg-white border border-light-gray rounded-sm overflow-hidden h-full flex flex-col group-hover:shadow-hover transition-shadow duration-200" style={{ borderWidth:'0.5px' }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={item.heroImage ?? 'https://images.unsplash.com/photo-1449844908441-8829872d2607?w=800&q=80'} alt={item.title} className="w-full h-[200px] object-cover" />
                      <div className="p-5 flex flex-col flex-1">
                        <span className={`inline-block font-sans text-[11px] font-medium px-2.5 py-1 rounded-full mb-3 ${categoryColors[item.category] ?? 'bg-cream text-charcoal'}`}>{localiseLabel(item.category, CATEGORY_AR, locale)}</span>
                        <h3 className="font-serif text-[18px] text-charcoal leading-[1.3] mb-3 flex-1">
                          {localise(item.title, item.titleAr, locale)}
                        </h3>
                        <p className="font-sans text-[13px] text-taupe line-clamp-2 mb-4">{localise(item.summary, item.summaryAr, locale)}</p>
                        <p className="font-sans text-[12px] text-mid-gray">
                          {item.author} · {item.publishedAt ? new Date(item.publishedAt).toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US', { month:'long', day:'numeric', year:'numeric' }) : ''}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </main>
  )
}
