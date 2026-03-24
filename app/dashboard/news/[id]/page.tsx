import React from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { StatusBadge } from '@/components/dashboard/DashboardShared'

const categoryColors: Record<string, string> = {
  'Company news': 'bg-blue-50 text-blue-800',
  'Market update': 'bg-green-50 text-green-800',
  'Awards': 'bg-amber-50 text-amber-800',
  'Industry insight': 'bg-purple-50 text-purple-800',
  'Transaction': 'bg-orange-50 text-orange-800',
}

export default async function DashboardNewsDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const numericId = Number(id)

  if (!Number.isInteger(numericId) || numericId <= 0) {
    notFound()
  }

  const article = await prisma.newsArticle.findUnique({
    where: { id: numericId },
  })

  if (!article) {
    notFound()
  }

  const paragraphs = article.body.split('\n\n').filter(Boolean)

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <Link href="/dashboard/news" className="flex items-center gap-2 font-sans text-[13px] text-taupe hover:text-charcoal no-underline transition-colors">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
          All news
        </Link>
        <Link href={`/dashboard/news/edit/${article.id}`} className="bg-gold hover:bg-gold-dark text-charcoal font-sans text-[13px] font-medium px-6 py-2.5 rounded-full transition-colors no-underline">
          Edit article
        </Link>
      </div>

      <div className="bg-white border border-light-gray rounded-sm p-6" style={{ borderWidth: '0.5px' }}>
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <StatusBadge status={article.isPublished ? 'Published' : 'Draft'} variant={article.isPublished ? 'gold' : 'gray'} />
          <span className={`font-sans text-[12px] font-medium px-3 py-1 rounded-full ${categoryColors[article.category] ?? 'bg-cream text-charcoal'}`}>
            {article.category}
          </span>
        </div>
        <h1 className="font-serif text-[28px] text-charcoal leading-[1.2] mb-3">{article.title}</h1>
        <p className="font-sans text-[14px] text-taupe mb-4">{article.summary}</p>
        <div className="flex flex-wrap gap-5 pt-4 border-t border-light-gray" style={{ borderWidth: '0.5px 0 0 0' }}>
          {[
            ['Author', article.author],
            ['Published', article.publishedAt ? new Date(article.publishedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '—'],
          ].map(([label, value]) => (
            <div key={label}>
              <p className="font-sans text-[11px] text-taupe uppercase tracking-wider mb-0.5">{label}</p>
              <p className="font-sans text-[14px] text-charcoal">{value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-sm overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={article.heroImage ?? 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1200&q=80'} alt={article.title} className="w-full h-[260px] object-cover" />
      </div>

      <div className="bg-white border border-light-gray rounded-sm p-6" style={{ borderWidth: '0.5px' }}>
        <h2 className="font-serif text-[16px] text-charcoal mb-5">Article body</h2>
        {paragraphs.map((paragraph, index) => (
          <p key={index} className="font-sans text-[14px] text-taupe leading-[1.7] mb-4 last:mb-0">
            {paragraph}
          </p>
        ))}
      </div>
    </div>
  )
}
