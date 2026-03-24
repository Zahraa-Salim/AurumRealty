'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import ImageUpload from '@/components/ImageUpload'
import { DashboardAccessDenied } from '@/components/dashboard/DashboardAccessDenied'
import { BLOG_AUTHOR_OPTIONS, BLOG_TOPIC_OPTIONS } from '@/lib/content-options'
import { hasAnyPermission } from '@/lib/rbac'

type SaveState = 'idle' | 'saving' | 'error'

export default function DashboardEditBlogPostPage() {
  const router = useRouter()
  const { id } = useParams<{ id: string }>()
  const { data: session, status } = useSession()
  const sessionAuthor = session?.user?.name?.trim() || ''
  const canEdit = hasAnyPermission(session?.user?.permissions ?? [], ['blog.edit'])
  const authorOptions = Array.from(new Set([sessionAuthor, ...BLOG_AUTHOR_OPTIONS, 'Aurum Realty'].filter(Boolean)))

  const [loading,     setLoading]     = useState(true)
  const [notFound,    setNotFound]    = useState(false)
  const [title,       setTitle]       = useState('')
  const [slug,        setSlug]        = useState('')
  const [topic,       setTopic]       = useState('')
  const [author,      setAuthor]      = useState('')
  const [subtitle,    setSubtitle]    = useState('')
  const [body,        setBody]        = useState('')
  const [pullQuote,   setPullQuote]   = useState('')
  const [heroImage,   setHeroImage]   = useState('')
  const [readTime,    setReadTime]    = useState('')
  const [publishDate, setPublishDate] = useState('')
  const [isPublished, setIsPublished] = useState(false)
  const [saveState,   setSaveState]   = useState<SaveState>('idle')
  const [errorMsg,    setErrorMsg]    = useState('')

  useEffect(() => {
    if (status !== 'authenticated' || !canEdit) {
      return
    }

    fetch(`/api/blog/${id}`)
      .then(r => { if (!r.ok) throw new Error(); return r.json() })
      .then(d => {
        setTitle(d.title ?? ''); setSlug(d.slug ?? ''); setTopic(d.topic ?? '')
        setAuthor(d.author ?? ''); setSubtitle(d.subtitle ?? ''); setBody(d.body ?? '')
        setPullQuote(d.pullQuote ?? ''); setHeroImage(d.heroImage ?? '')
        setReadTime(d.readTime ?? ''); setIsPublished(d.isPublished ?? false)
        setPublishDate(d.publishedAt ? d.publishedAt.split('T')[0] : '')
        setLoading(false)
      })
      .catch(() => { setNotFound(true); setLoading(false) })
  }, [canEdit, id, status])

  if (status === 'loading') {
    return (
      <div className="max-w-4xl mx-auto pt-12 text-center">
        <p className="font-sans text-[14px] text-taupe">Loading blog editor…</p>
      </div>
    )
  }

  if (!canEdit) {
    return <DashboardAccessDenied message="You do not have permission to edit blog posts." />
  }

  const handleSave = async () => {
    if (!title || !slug || !topic || !author || !body) {
      setErrorMsg('Title, slug, topic, author and body are required.'); return
    }
    setSaveState('saving'); setErrorMsg('')
    try {
      const res = await fetch(`/api/blog/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title, slug, topic, author, subtitle, body, pullQuote,
          heroImage:   heroImage  || null,
          readTime:    readTime   || null,
          isPublished,
          publishedAt: isPublished ? (publishDate ? new Date(publishDate) : new Date()) : null,
        }),
      })
      if (!res.ok) throw new Error()
      router.push(`/dashboard/blog/${id}`)
    } catch {
      setErrorMsg('Failed to save. Please try again.'); setSaveState('error')
    }
  }

  const ic = 'h-[44px] px-4 font-sans text-[14px] text-charcoal bg-white border border-light-gray rounded-sm focus:outline-none focus:border-charcoal focus:shadow-focus'

  if (loading)  return <div className="max-w-4xl mx-auto pt-12 text-center"><p className="font-sans text-[14px] text-taupe">Loading post…</p></div>
  if (notFound) return <div className="max-w-4xl mx-auto pt-12 text-center"><p className="font-serif text-[20px] text-charcoal mb-2">Post not found</p><Link href="/dashboard/blog" className="font-sans text-[13px] text-taupe no-underline hover:text-charcoal">← Back to blog</Link></div>

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-24">
      <div className="flex items-center justify-between mb-6">
        <Link href="/dashboard/blog" className="flex items-center gap-2 font-sans text-[13px] text-taupe hover:text-charcoal no-underline transition-colors">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          All posts
        </Link>
        <div className="flex items-center gap-5">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <span className="font-sans text-[13px] font-medium text-taupe">Draft</span>
            <div className={`w-10 h-5 rounded-full relative transition-colors cursor-pointer ${isPublished ? 'bg-success' : 'bg-light-gray'}`}
              onClick={() => setIsPublished(p => !p)}>
              <div className={`w-3 h-3 bg-white rounded-full absolute top-1 transition-transform ${isPublished ? 'translate-x-6' : 'translate-x-1'}`} />
            </div>
            <span className="font-sans text-[13px] font-medium text-charcoal">Published</span>
          </label>
          <button onClick={handleSave} disabled={saveState === 'saving'}
            className="px-8 py-2.5 rounded-full font-sans text-[13px] font-medium text-charcoal bg-gold hover:bg-gold-dark disabled:opacity-60 transition-colors border-none cursor-pointer">
            {saveState === 'saving' ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </div>
      {errorMsg && <p className="font-sans text-[13px] text-error bg-error/5 px-4 py-3 rounded-sm">{errorMsg}</p>}

      <div className="bg-white border border-light-gray rounded-sm p-8" style={{borderWidth:'0.5px'}}>
        <h2 className="font-serif text-[16px] text-charcoal mb-6">Meta</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="col-span-2 flex flex-col gap-2">
            <label className="font-sans text-[13px] font-medium text-charcoal">Title</label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} className={`w-full ${ic}`} style={{borderWidth:'0.5px'}} />
          </div>
          <div className="col-span-2 flex flex-col gap-2">
            <label className="font-sans text-[13px] font-medium text-charcoal">Slug</label>
            <input type="text" value={slug} onChange={e => setSlug(e.target.value)}
              className="w-full h-[44px] px-4 font-sans text-[14px] text-taupe bg-light-gray/10 border border-light-gray rounded-sm focus:outline-none"
              style={{borderWidth:'0.5px'}} />
          </div>
          <div className="flex flex-col gap-2">
            <label className="font-sans text-[13px] font-medium text-charcoal">Topic</label>
            <select value={topic} onChange={e => setTopic(e.target.value)} className={`w-full ${ic}`} style={{borderWidth:'0.5px'}}>
              <option value="">Select topic…</option>
              {BLOG_TOPIC_OPTIONS.map(option => (
                <option key={option}>{option}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <label className="font-sans text-[13px] font-medium text-charcoal">Author</label>
            <>
              <input
                type="text"
                value={author}
                onChange={e => setAuthor(e.target.value)}
                list="blog-edit-author-options"
                placeholder={sessionAuthor || 'Type an author name'}
                className={`w-full ${ic}`}
                style={{borderWidth:'0.5px'}}
              />
              <datalist id="blog-edit-author-options">
                {authorOptions.map(option => (
                  <option key={option} value={option} />
                ))}
              </datalist>
            </>
          </div>
          <div className="flex flex-col gap-2">
            <label className="font-sans text-[13px] font-medium text-charcoal">Publish date</label>
            <input type="date" value={publishDate} onChange={e => setPublishDate(e.target.value)} className={`w-full ${ic}`} style={{borderWidth:'0.5px'}} />
          </div>
          <div className="flex flex-col gap-2">
            <label className="font-sans text-[13px] font-medium text-charcoal">Read time</label>
            <input type="text" value={readTime} onChange={e => setReadTime(e.target.value)} placeholder="e.g. 5 min read" className={`w-full ${ic}`} style={{borderWidth:'0.5px'}} />
          </div>
        </div>
      </div>

      <div className="bg-white border border-light-gray rounded-sm p-8" style={{borderWidth:'0.5px'}}>
        <h2 className="font-serif text-[16px] text-charcoal mb-6">Hero image</h2>
        <ImageUpload
          value={heroImage}
          onChange={setHeroImage}
          label="Hero image"
          hint="Choose a new image or paste a URL."
        />
      </div>

      <div className="bg-white border border-light-gray rounded-sm p-8" style={{borderWidth:'0.5px'}}>
        <h2 className="font-serif text-[16px] text-charcoal mb-6">Content</h2>
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label className="font-sans text-[13px] font-medium text-charcoal">Subtitle</label>
            <input type="text" value={subtitle} onChange={e => setSubtitle(e.target.value)} className={`w-full ${ic}`} style={{borderWidth:'0.5px'}} />
          </div>
          <div className="flex flex-col gap-2">
            <label className="font-sans text-[13px] font-medium text-charcoal">Body</label>
            <textarea value={body} onChange={e => setBody(e.target.value)} rows={15}
              className="w-full p-4 font-sans text-[14px] text-charcoal bg-white border border-light-gray rounded-sm focus:outline-none focus:border-charcoal resize-y min-h-[200px]"
              style={{borderWidth:'0.5px'}} />
          </div>
          <div className="flex flex-col gap-2">
            <label className="font-sans text-[13px] font-medium text-charcoal">Pull quote <span className="font-normal text-taupe">(optional)</span></label>
            <div className="relative">
              <div className="absolute left-0 top-0 bottom-0 w-[4px] bg-gold rounded-l-sm" />
              <textarea value={pullQuote} onChange={e => setPullQuote(e.target.value)} rows={3}
                className="w-full p-4 pl-6 font-sans text-[14px] text-charcoal bg-white border border-light-gray rounded-sm focus:outline-none focus:border-charcoal resize-y min-h-[80px]"
                style={{borderWidth:'0.5px'}} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
