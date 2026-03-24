'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import ImageUpload from '@/components/ImageUpload'
import { DashboardAccessDenied } from '@/components/dashboard/DashboardAccessDenied'
import { BLOG_AUTHOR_OPTIONS, BLOG_TOPIC_OPTIONS } from '@/lib/content-options'
import { hasAnyPermission } from '@/lib/rbac'

const ic = 'w-full h-[44px] px-4 font-sans text-[14px] text-charcoal bg-white border border-light-gray rounded-sm focus:outline-none focus:border-charcoal'
const sc = 'w-full h-[44px] px-4 font-sans text-[14px] text-charcoal bg-white border border-light-gray rounded-sm focus:outline-none focus:border-charcoal appearance-none'

function toSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

export default function DashboardNewBlogPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const sessionAuthor = session?.user?.name?.trim() || ''
  const canCreate = hasAnyPermission(session?.user?.permissions ?? [], ['blog.create'])
  const authorOptions = Array.from(new Set([sessionAuthor, ...BLOG_AUTHOR_OPTIONS, 'Aurum Realty'].filter(Boolean)))

  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [slugTouched, setSlugTouched] = useState(false)
  const [topic, setTopic] = useState<string>(BLOG_TOPIC_OPTIONS[0])
  const [body, setBody] = useState('')
  const [pullQuote, setPullQuote] = useState('')
  const [heroImage, setHeroImage] = useState('')
  const [author, setAuthor] = useState(sessionAuthor)
  const [published, setPublished] = useState(false)

  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  if (status === 'loading') {
    return (
      <div className="max-w-4xl mx-auto pt-12 text-center">
        <p className="font-sans text-[14px] text-taupe">Loading blog editor…</p>
      </div>
    )
  }

  if (!canCreate) {
    return <DashboardAccessDenied message="You do not have permission to create blog posts." />
  }

  const handleTitleChange = (value: string) => {
    setTitle(value)
    if (!slugTouched) setSlug(toSlug(value))
  }

  const handleSave = async () => {
    if (!title.trim()) {
      setErrorMsg('Title is required.')
      return
    }

    if (!slug.trim()) {
      setErrorMsg('Slug is required.')
      return
    }

    if (!body.trim()) {
      setErrorMsg('Body content is required.')
      return
    }

    setSaveState('saving')
    setErrorMsg('')

    try {
      const res = await fetch('/api/blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          slug: slug.trim(),
          topic,
          author: author.trim() || sessionAuthor || 'Aurum Realty',
          body: body.trim(),
          pullQuote: pullQuote.trim() || null,
          heroImage: heroImage || null,
          isPublished: published,
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Save failed')
      }

      const post = await res.json()
      router.push(`/dashboard/blog/${post.id}`)
    } catch (e: unknown) {
      setErrorMsg(e instanceof Error ? e.message : 'Failed to save. Please try again.')
      setSaveState('error')
      setTimeout(() => setSaveState('idle'), 3000)
    }
  }

  return (
    <div className="max-w-4xl mx-auto pb-24">
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link href="/dashboard/blog" className="font-sans text-[13px] text-taupe hover:text-charcoal no-underline">Blog</Link>
            <span className="text-taupe">/</span>
            <span className="font-sans text-[13px] text-charcoal">New post</span>
          </div>
          <h1 className="font-serif text-[28px] text-charcoal">New blog post</h1>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <div
              className={`w-10 h-5 rounded-full relative transition-colors cursor-pointer ${published ? 'bg-charcoal' : 'bg-light-gray'}`}
              onClick={() => setPublished(value => !value)}
            >
              <div className={`w-3 h-3 bg-white rounded-full absolute top-1 transition-transform ${published ? 'translate-x-6' : 'translate-x-1'}`} />
            </div>
            <span className="font-sans text-[13px] text-charcoal">{published ? 'Published' : 'Draft'}</span>
          </label>
          <button
            onClick={handleSave}
            disabled={saveState === 'saving'}
            className="px-8 py-2.5 rounded-full font-sans text-[13px] font-medium bg-gold hover:bg-gold-dark text-charcoal transition-colors border-none cursor-pointer disabled:opacity-60"
          >
            {saveState === 'saving' ? 'Saving…' : 'Save post'}
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="mb-6 px-4 py-3 bg-error/5 border border-error/20 rounded-sm" style={{ borderWidth: '0.5px' }}>
          <p className="font-sans text-[13px] text-error">{errorMsg}</p>
        </div>
      )}

      <div className="space-y-6">
        <Section title="Hero image">
          <ImageUpload value={heroImage} onChange={setHeroImage} label="Featured image" hint="Choose the main image for this article." />
        </Section>

        <Section title="Article details">
          <div className="space-y-5">
            <F label="Title *">
              <input value={title} onChange={e => handleTitleChange(e.target.value)} type="text" className={ic} style={{ borderWidth: '0.5px' }} />
            </F>
            <F label="Slug *">
              <input
                value={slug}
                onChange={e => {
                  setSlug(toSlug(e.target.value))
                  setSlugTouched(true)
                }}
                type="text"
                className={ic}
                style={{ borderWidth: '0.5px' }}
              />
              <p className="font-sans text-[12px] text-taupe">URL: /blog/{slug || 'your-article-slug'}</p>
            </F>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <F label="Topic">
                <select value={topic} onChange={e => setTopic(e.target.value)} className={sc} style={{ borderWidth: '0.5px' }}>
                  {BLOG_TOPIC_OPTIONS.map(option => (
                    <option key={option}>{option}</option>
                  ))}
                </select>
              </F>
              <F label="Author name">
                <>
                  <input
                    value={author}
                    onChange={e => setAuthor(e.target.value)}
                    type="text"
                    list="blog-author-options"
                    placeholder={sessionAuthor || 'e.g. Sarah Johnson'}
                    className={ic}
                    style={{ borderWidth: '0.5px' }}
                  />
                  <datalist id="blog-author-options">
                    {authorOptions.map(option => (
                      <option key={option} value={option} />
                    ))}
                  </datalist>
                </>
              </F>
            </div>
          </div>
        </Section>

        <Section title="Content">
          <div className="space-y-5">
            <F label="Body *">
              <textarea
                value={body}
                onChange={e => setBody(e.target.value)}
                rows={16}
                placeholder="Write your article here. Separate paragraphs with a blank line."
                className="w-full p-4 font-sans text-[14px] text-charcoal bg-white border border-light-gray rounded-sm focus:outline-none focus:border-charcoal resize-y leading-[1.8]"
                style={{ borderWidth: '0.5px' }}
              />
            </F>
            <F label="Pull quote (optional)">
              <input value={pullQuote} onChange={e => setPullQuote(e.target.value)} type="text" placeholder="A memorable sentence to highlight mid-article" className={ic} style={{ borderWidth: '0.5px' }} />
            </F>
          </div>
        </Section>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-light-gray rounded-sm p-8" style={{ borderWidth: '0.5px' }}>
      <h2 className="font-serif text-[20px] text-charcoal mb-6">{title}</h2>
      {children}
    </div>
  )
}

function F({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="font-sans text-[13px] font-medium text-charcoal">{label}</label>
      {children}
    </div>
  )
}
