/**
 * BlogClientFilter — app/(public)/blog/BlogClientFilter.tsx
 *
 * Client component that handles the topic filter UI.
 * Receives all posts as props from the server BlogPage.
 * Filters locally — no extra API calls needed.
 */

'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { BLOG_TOPIC_OPTIONS } from '@/lib/content-options'
import { localise, localiseLabel, localiseReadTime, TOPIC_AR, type Locale } from '@/lib/i18n'

const TOPICS_EN = ['All', ...BLOG_TOPIC_OPTIONS]
const TOPICS_AR = ['الكل', 'توقعات السوق', 'استثمار', 'رؤى المشترين', 'أدلة']

// Maps Arabic topic label → English DB value for filtering
const AR_TO_EN_TOPIC: Record<string, string> = {
  'الكل':          'All',
  'توقعات السوق':  'Market outlook',
  'استثمار':       'Investment',
  'رؤى المشترين':  'Buyer insight',
  'أدلة':          'Guides',
}

const topicColor: Record<string, string> = {
  'Market outlook': 'bg-blue-50 text-blue-800',
  'Investment':     'bg-amber-50 text-amber-800',
  'Buyer insight':  'bg-green-50 text-green-800',
  'Guides':         'bg-purple-50 text-purple-800',
}

type Post = {
  id: number
  slug: string
  title: string
  titleAr: string | null
  topic: string
  author: string
  subtitle: string | null
  subtitleAr: string | null
  heroImage: string | null
  readTime: string | null
  publishedAt: Date | string | null
}

export default function BlogClientFilter({ posts, locale }: { posts: Post[]; locale: Locale }) {
  const [activeTopic, setActiveTopic] = useState('All')
  const TOPICS = locale === 'ar' ? TOPICS_AR : TOPICS_EN

  const featured = posts[0]
  // Resolve the active topic to its English DB value for filtering
  const activeTopic_en = locale === 'ar' ? (AR_TO_EN_TOPIC[activeTopic] ?? activeTopic) : activeTopic
  const isAll     = activeTopic_en === 'All'
  const filtered  = posts.filter(p => isAll || p.topic === activeTopic_en)
  const gridPosts = isAll ? posts.slice(1) : filtered

  const formatDate = (d: Date | string | null) => {
    if (!d) return ''
    return new Date(d).toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  }

  return (
    <div className="max-w-[1200px] mx-auto px-4 md:px-8 py-12">

      {/* Featured article — always the first post, only shown on "All" */}
      {isAll && featured && (
        <Link href={`/blog/${featured.slug}`} className="block group no-underline mb-14">
          <div className="flex flex-col lg:flex-row gap-10 items-center">
            <div className="w-full lg:w-[55%] overflow-hidden rounded-sm">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={featured.heroImage ?? 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1200&q=80'}
                alt={featured.title}
                className="w-full h-[360px] object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <div className="w-full lg:w-[45%]">
              <span className={`inline-block font-sans text-[12px] font-medium px-3 py-1 rounded-full mb-4 ${topicColor[featured.topic] ?? 'bg-cream text-charcoal'}`}>
                {localiseLabel(featured.topic, TOPIC_AR, locale)}
              </span>
              <h2 className="font-serif text-[28px] md:text-[34px] text-charcoal leading-[1.2] mb-4 group-hover:text-taupe transition-colors">
                {localise(featured.title, featured.titleAr, locale)}
              </h2>
              {featured.subtitle && (
                <p className="font-sans text-[15px] text-taupe leading-[1.7] mb-5">
                  {localise(featured.subtitle, featured.subtitleAr, locale)}
                </p>
              )}
              <div className="flex items-center gap-2 font-sans text-[13px] text-mid-gray">
                <span>{featured.author}</span>
                <span>·</span>
                <span>{formatDate(featured.publishedAt)}</span>
                {featured.readTime && <><span>·</span><span>{localiseReadTime(featured.readTime, locale)}</span></>}
              </div>
            </div>
          </div>
        </Link>
      )}

      {/* Topic filter */}
      <div className="flex flex-wrap gap-2 mb-10">
        {TOPICS.map(topic => (
          <button
            key={topic}
            onClick={() => setActiveTopic(topic)}
            className={`h-[36px] px-5 font-sans text-[13px] rounded-full border transition-all duration-150 cursor-pointer ${
              activeTopic === topic
                ? 'bg-charcoal text-white border-charcoal'
                : 'bg-white text-charcoal border-light-gray hover:border-charcoal/50'
            }`}
            style={{ borderWidth: '0.5px' }}
          >
            {topic}
          </button>
        ))}
      </div>

      {/* Article grid */}
      {gridPosts.length === 0 ? (
        <div className="text-center py-16">
          <p className="font-serif text-[22px] text-charcoal mb-3">
            {locale === 'ar' ? 'لا توجد مقالات في هذا الموضوع حتى الآن' : 'No articles in this topic yet'}
          </p>
          <button onClick={() => setActiveTopic(locale === 'ar' ? TOPICS_AR[0] : TOPICS_EN[0])} className="font-sans text-[13px] text-taupe hover:text-charcoal underline bg-transparent border-none cursor-pointer">
            {locale === 'ar' ? 'عرض جميع المقالات' : 'View all articles'}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {gridPosts.map(post => (
            <Link key={post.id} href={`/blog/${post.slug}`} className="block group no-underline">
              <div className="bg-white border border-light-gray rounded-sm overflow-hidden group-hover:shadow-hover transition-shadow duration-200 h-full flex flex-col" style={{ borderWidth: '0.5px' }}>
                <div className="relative overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={post.heroImage ?? 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80'}
                    alt={post.title}
                    className="w-full h-[220px] object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <span className={`absolute bottom-3 left-3 font-sans text-[11px] font-medium px-3 py-1 rounded-full bg-white/90 text-charcoal`}>
                    {localiseLabel(post.topic, TOPIC_AR, locale)}
                  </span>
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <h3 className="font-serif text-[18px] text-charcoal leading-[1.3] mb-3 group-hover:text-taupe transition-colors flex-1">
                    {localise(post.title, post.titleAr, locale)}
                  </h3>
                  {post.subtitle && (
                    <p className="font-sans text-[13px] text-taupe line-clamp-1 mb-4">
                      {localise(post.subtitle, post.subtitleAr, locale)}
                    </p>
                  )}
                  <div className="flex items-center justify-between pt-4 border-t border-light-gray" style={{ borderWidth: '0.5px 0 0 0' }}>
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-light-gray flex items-center justify-center flex-shrink-0">
                        <span className="font-sans text-[10px] font-medium text-charcoal">
                          {post.author.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <span className="font-sans text-[12px] text-charcoal">{post.author}</span>
                    </div>
                    {post.readTime && <span className="font-sans text-[12px] text-taupe">{localiseReadTime(post.readTime, locale)}</span>}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
