import React from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { StatusBadge } from '@/components/dashboard/DashboardShared'

const topicColors: Record<string, string> = {
  'Market outlook': 'bg-blue-50 text-blue-800',
  'Investment': 'bg-amber-50 text-amber-800',
  'Buyer insight': 'bg-green-50 text-green-800',
  'Guides': 'bg-purple-50 text-purple-800',
}

export default async function DashboardBlogDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const numericId = Number(id)

  if (!Number.isInteger(numericId) || numericId <= 0) {
    notFound()
  }

  const post = await prisma.blogPost.findUnique({
    where: { id: numericId },
  })

  if (!post) {
    notFound()
  }

  const paragraphs = post.body.split('\n\n').filter(Boolean)

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <Link href="/dashboard/blog" className="flex items-center gap-2 font-sans text-[13px] text-taupe hover:text-charcoal no-underline transition-colors">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
          All posts
        </Link>
        <Link href={`/dashboard/blog/edit/${post.id}`} className="bg-gold hover:bg-gold-dark text-charcoal font-sans text-[13px] font-medium px-6 py-2.5 rounded-full transition-colors no-underline">
          Edit post
        </Link>
      </div>

      <div className="bg-white border border-light-gray rounded-sm p-6" style={{ borderWidth: '0.5px' }}>
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <StatusBadge status={post.isPublished ? 'Published' : 'Draft'} variant={post.isPublished ? 'gold' : 'gray'} />
          <span className={`font-sans text-[12px] font-medium px-3 py-1 rounded-full ${topicColors[post.topic] ?? 'bg-cream text-charcoal'}`}>
            {post.topic}
          </span>
        </div>
        <h1 className="font-serif text-[28px] text-charcoal leading-[1.2] mb-3">{post.title}</h1>
        {post.subtitle && <p className="font-sans text-[14px] text-taupe italic mb-4">{post.subtitle}</p>}
        <div className="flex flex-wrap gap-5 pt-4 border-t border-light-gray" style={{ borderWidth: '0.5px 0 0 0' }}>
          {[
            ['Author', post.author],
            ['Published', post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '—'],
            ['Read time', post.readTime || '—'],
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
        <img src={post.heroImage ?? 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1200&q=80'} alt={post.title} className="w-full h-[280px] object-cover" />
      </div>

      <div className="bg-white border border-light-gray rounded-sm p-6" style={{ borderWidth: '0.5px' }}>
        <h2 className="font-serif text-[16px] text-charcoal mb-5">Article body</h2>
        {paragraphs.map((paragraph, index) => (
          <p key={index} className="font-sans text-[14px] text-taupe leading-[1.7] mb-4 last:mb-0">
            {paragraph}
          </p>
        ))}
      </div>

      {post.pullQuote && (
        <div className="bg-white border border-light-gray rounded-sm p-6" style={{ borderWidth: '0.5px' }}>
          <h2 className="font-serif text-[16px] text-charcoal mb-4">Pull quote</h2>
          <div className="border-l-[3px] border-gold pl-5">
            <p className="font-serif text-[16px] text-charcoal italic leading-[1.6]">{post.pullQuote}</p>
          </div>
        </div>
      )}
    </div>
  )
}
