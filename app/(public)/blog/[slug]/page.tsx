/**
 * BlogPostPage — /blog/[slug]
 * Fetches post from DB by slug. 404 if not found.
 * Body stored as plain text, rendered by splitting on double newlines.
 * Lines starting with "## " become h2 headings.
 */
import React from 'react'
import Link from 'next/link'
import type { BlogPost } from '@prisma/client'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { getServerLocale } from '@/lib/locale-server'
import { localise, localiseLabel, localiseReadTime, TOPIC_AR, AUTHOR_ROLE_AR } from '@/lib/i18n'

export const revalidate = 60

type RelatedBlogPost = Pick<
  BlogPost,
  'slug' | 'title' | 'titleAr' | 'topic' | 'heroImage' | 'author' | 'readTime'
>

const authorRole: Record<string,string> = {
  'Sarah Johnson':'Managing Director','Michael Chen':'Senior Agent','Emily Brooks':'Investment Specialist',
}
const authorRoleAr: Record<string,string> = {
  'Sarah Johnson':'المدير العام','Michael Chen':'وكيل أول','Emily Brooks':'متخصص استثمار',
}
// Inline styles used instead of Tailwind color utilities (blue-50, amber-50 etc.)
// because those classes aren't in the custom theme and get purged in production.
const topicColor: Record<string, { bg: string; color: string }> = {
  'Market outlook': { bg: '#EFF6FF', color: '#1E40AF' },
  'Investment':     { bg: '#FFFBEB', color: '#92400E' },
  'Buyer insight':  { bg: '#F0FDF4', color: '#166534' },
  'Guides':         { bg: '#FAF5FF', color: '#6B21A8' },
}

export async function generateStaticParams() {
  try {
    const posts = await prisma.blogPost.findMany({ where:{isPublished:true}, select:{slug:true} })
    return posts.map(p=>({slug:p.slug}))
  } catch { return [] }
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const locale = await getServerLocale()

  let post: BlogPost | null = null
  let related: RelatedBlogPost[] = []

  try {
    post = await prisma.blogPost.findUnique({ where: { slug } })
    if (!post || !post.isPublished) notFound()
    related = await prisma.blogPost.findMany({
      where: { isPublished: true, slug: { not: slug } },
      orderBy: { publishedAt: 'desc' },
      take: 3,
      select: { slug: true, title: true, titleAr: true, topic: true, heroImage: true, author: true, readTime: true },
    })
  } catch {
    notFound()
  }

  if (!post) {
    notFound()
  }

  // Apply locale overrides
  const title     = localise(post.title,     (post as any).titleAr,     locale)
  const subtitle  = localise(post.subtitle,  (post as any).subtitleAr,  locale)
  const pullQuote = localise(post.pullQuote, (post as any).pullQuoteAr, locale)
  const rawBody   = (locale === 'ar' && (post as any).bodyAr) ? (post as any).bodyAr : post.body

  const fmt=(d:Date|string|null)=>d?new Date(d).toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US',{year:'numeric',month:'long',day:'numeric'}):''

  const isHtml = (rawBody || '').trimStart().startsWith('<')
  const bodyHtml = isHtml
    ? rawBody ?? ''
    : (rawBody || '').split('\n\n').filter(Boolean)
        .map((para: string) =>
          para.startsWith('## ') ? `<h2>${para.replace('## ', '')}</h2>` : `<p>${para}</p>`
        ).join('')

  return (
    <main className="w-full bg-white pb-24">
      <div className="w-full h-[50vh] md:h-[60vh] relative overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={post.heroImage??'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1920&q=80'} alt={title} className="w-full h-full object-cover"/>
        <div className="absolute inset-0 bg-charcoal/20"/>
      </div>

      <article className="max-w-[740px] mx-auto px-4 md:px-8 py-12 md:py-16">
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <Link href="/blog" className="font-sans text-[13px] text-taupe hover:text-charcoal no-underline transition-colors">
            {locale === 'ar' ? '→ المجلة' : '← Journal'}
          </Link>
          <span className="text-light-gray">·</span>
          <span className="font-sans text-[12px] font-medium px-3 py-1 rounded-full" style={topicColor[post.topic] ?? { bg: '#F5E6D3', color: '#1F1F1F' }}>{localiseLabel(post.topic, TOPIC_AR, locale)}</span>
        </div>
        <h1 className="font-serif text-[32px] md:text-[44px] text-charcoal leading-[1.15] mb-5">{title}</h1>
        {subtitle && <p className="font-sans text-[17px] text-taupe leading-[1.7] mb-8 border-l-[3px] border-gold pl-5 italic">{subtitle}</p>}
        <div className="flex items-center gap-4 pb-8 border-b border-light-gray mb-10" style={{borderWidth:'0 0 0.5px 0'}}>
          <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center flex-shrink-0">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1F1F1F" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="8" r="4"/><path d="M4 20c0-3.3 3.6-6 8-6s8 2.7 8 6"/>
            </svg>
          </div>
          <div>
            <p className="font-sans text-[14px] font-medium text-charcoal">{post.author}</p>
            <p className="font-sans text-[12px] text-taupe">{locale === 'ar' ? (authorRoleAr[post.author] ?? 'أوروم ريالتي') : (authorRole[post.author]??'Aurum Realty')}</p>
          </div>
          <div className="ml-auto text-right">
            <p className="font-sans text-[13px] text-taupe">{fmt(post.publishedAt)}</p>
            {post.readTime&&<p className="font-sans text-[12px] text-mid-gray">{localiseReadTime(post.readTime, locale)}</p>}
          </div>
        </div>
        <div className="article-body" dangerouslySetInnerHTML={{ __html: bodyHtml }} />
        {pullQuote && (
          <blockquote className="my-10 pl-6 border-l-[4px] border-gold">
            <p className="font-serif text-[20px] text-charcoal italic leading-[1.5]">{pullQuote}</p>
          </blockquote>
        )}
        <div className="mt-14 pt-8 border-t border-light-gray flex items-start gap-5" style={{borderWidth:'0.5px 0 0 0'}}>
          <div className="w-14 h-14 rounded-full bg-gold/20 flex items-center justify-center flex-shrink-0">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1F1F1F" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="8" r="4"/><path d="M4 20c0-3.3 3.6-6 8-6s8 2.7 8 6"/>
            </svg>
          </div>
          <div>
            <p className="font-sans text-[15px] font-medium text-charcoal mb-1">{post.author}</p>
            <p className="font-sans text-[13px] text-taupe mb-3">{locale === 'ar' ? (authorRoleAr[post.author] ?? 'أوروم ريالتي') : (authorRole[post.author]??'Aurum Realty')}</p>
            <Link href="/contact" className="font-sans text-[13px] font-medium text-charcoal underline hover:text-taupe transition-colors">
              {locale === 'ar' ? 'تواصل معنا →' : 'Get in touch →'}
            </Link>
          </div>
        </div>
      </article>

      {related.length>0&&(
        <section className="py-14 px-4 md:px-8 border-t border-light-gray max-w-[1200px] mx-auto" style={{borderWidth:'0.5px 0 0 0'}}>
          <h2 className="font-serif text-[26px] text-charcoal mb-8">
            {locale === 'ar' ? 'المزيد من المجلة' : 'More from the Journal'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {related.map((r) => (
              <Link key={r.slug} href={`/blog/${r.slug}`} className="block group no-underline">
                <div className="overflow-hidden rounded-sm mb-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={r.heroImage??'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80'} alt={r.title} className="w-full h-[180px] object-cover transition-transform duration-500 group-hover:scale-105"/>
                </div>
                <span className="inline-block font-sans text-[11px] font-medium px-2.5 py-1 rounded-full mb-2" style={topicColor[r.topic] ?? { bg: '#F5E6D3', color: '#1F1F1F' }}>{localiseLabel(r.topic, TOPIC_AR, locale)}</span>
                <h3 className="font-serif text-[17px] text-charcoal leading-[1.3] group-hover:text-taupe transition-colors">{localise(r.title, r.titleAr, locale)}</h3>
                <p className="font-sans text-[12px] text-taupe mt-2">{r.author}{r.readTime?` · ${localiseReadTime(r.readTime, locale)}`:''}</p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </main>
  )
}
