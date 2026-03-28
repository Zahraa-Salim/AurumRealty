'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import ImageUpload from '@/components/ImageUpload'
import { RichTextEditor } from '@/components/RichTextEditor'
import { DashboardAccessDenied } from '@/components/dashboard/DashboardAccessDenied'
import { hasAnyPermission } from '@/lib/rbac'

type SaveState = 'idle' | 'saving' | 'error'

export default function DashboardEditNewsArticlePage() {
  const router = useRouter()
  const { id } = useParams<{ id: string }>()
  const { data: session, status } = useSession()
  const sessionAuthor = session?.user?.name?.trim() || ''
  const canEdit = hasAnyPermission(session?.user?.permissions ?? [], ['news.edit'])
  const authorOptions = Array.from(new Set([sessionAuthor, 'Aurum Realty News Desk', 'Aurum Realty', 'Sarah Johnson', 'Michael Chen', 'Emily Brooks'].filter(Boolean)))

  const [loading,     setLoading]     = useState(true)
  const [notFound,    setNotFound]    = useState(false)
  const [title,       setTitle]       = useState('')
  const [slug,        setSlug]        = useState('')
  const [category,    setCategory]    = useState('')
  const [author,      setAuthor]      = useState('')
  const [summary,     setSummary]     = useState('')
  const [body,        setBody]        = useState('')
  const [heroImage,   setHeroImage]   = useState('')
  const [publishDate, setPublishDate] = useState('')
  const [isPublished, setIsPublished] = useState(false)
  const [titleAr,     setTitleAr]     = useState('')
  const [summaryAr,   setSummaryAr]   = useState('')
  const [bodyAr,      setBodyAr]      = useState('')
  const [saveState,   setSaveState]   = useState<SaveState>('idle')
  const [errorMsg,    setErrorMsg]    = useState('')

  useEffect(() => {
    if (status !== 'authenticated' || !canEdit) {
      return
    }

    fetch(`/api/news/${id}`)
      .then(r => { if (!r.ok) throw new Error(); return r.json() })
      .then(d => {
        setTitle(d.title ?? ''); setSlug(d.slug ?? ''); setCategory(d.category ?? '')
        setAuthor(d.author ?? ''); setSummary(d.summary ?? ''); setBody(d.body ?? '')
        setHeroImage(d.heroImage ?? ''); setIsPublished(d.isPublished ?? false)
        setPublishDate(d.publishedAt ? d.publishedAt.split('T')[0] : '')
        setTitleAr(d.titleAr ?? ''); setSummaryAr(d.summaryAr ?? ''); setBodyAr(d.bodyAr ?? '')
        setLoading(false)
      })
      .catch(() => { setNotFound(true); setLoading(false) })
  }, [canEdit, id, status])

  if (status === 'loading') {
    return (
      <div className="max-w-4xl mx-auto pt-12 text-center">
        <p className="font-sans text-[14px] text-taupe">Loading news editor…</p>
      </div>
    )
  }

  if (!canEdit) {
    return <DashboardAccessDenied message="You do not have permission to edit news articles." />
  }

  const handleSave = async () => {
    if (!title || !slug || !category || !author || !summary || !body) {
      setErrorMsg('Title, slug, category, author, summary and body are required.'); return
    }
    setSaveState('saving'); setErrorMsg('')
    try {
      const res = await fetch(`/api/news/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title, slug, category, author, summary, body,
          titleAr:     titleAr     || null,
          summaryAr:   summaryAr   || null,
          bodyAr:      bodyAr      || null,
          heroImage:   heroImage  || null,
          isPublished,
          publishedAt: isPublished ? (publishDate ? new Date(publishDate) : new Date()) : null,
        }),
      })
      if (!res.ok) throw new Error()
      router.push(`/dashboard/news/${id}`)
    } catch {
      setErrorMsg('Failed to save. Please try again.'); setSaveState('error')
    }
  }

  const ic = 'h-[44px] px-4 font-sans text-[14px] text-charcoal bg-white border border-light-gray rounded-sm focus:outline-none focus:border-charcoal'

  if (loading)  return <div className="max-w-4xl mx-auto pt-12 text-center"><p className="font-sans text-[14px] text-taupe">Loading article…</p></div>
  if (notFound) return <div className="max-w-4xl mx-auto pt-12 text-center"><p className="font-serif text-[20px] text-charcoal mb-2">Article not found</p><Link href="/dashboard/news" className="font-sans text-[13px] text-taupe no-underline hover:text-charcoal">← Back to news</Link></div>

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-24">
      <div className="flex items-center justify-between mb-6">
        <Link href="/dashboard/news" className="flex items-center gap-2 font-sans text-[13px] text-taupe hover:text-charcoal no-underline transition-colors">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          All news
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
        <h2 className="font-serif text-[16px] text-charcoal mb-6">Article details</h2>
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
            <label className="font-sans text-[13px] font-medium text-charcoal">Category</label>
            <select value={category} onChange={e => setCategory(e.target.value)} className={`w-full ${ic}`} style={{borderWidth:'0.5px'}}>
              <option value="">Select category…</option>
              <option>Company news</option><option>Market update</option>
              <option>Awards</option><option>Industry insight</option><option>Transaction</option>
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <label className="font-sans text-[13px] font-medium text-charcoal">Author</label>
            <>
              <input
                type="text"
                value={author}
                onChange={e => setAuthor(e.target.value)}
                list="news-edit-author-options"
                placeholder={sessionAuthor || 'Type an author name'}
                className={`w-full ${ic}`}
                style={{borderWidth:'0.5px'}}
              />
              <datalist id="news-edit-author-options">
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
        </div>
      </div>

      <div className="bg-white border border-light-gray rounded-sm p-8" style={{borderWidth:'0.5px'}}>
        <h2 className="font-serif text-[16px] text-charcoal mb-6">Summary & image</h2>
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label className="font-sans text-[13px] font-medium text-charcoal">Summary</label>
            <textarea value={summary} onChange={e => setSummary(e.target.value)} rows={3}
              className="w-full p-4 font-sans text-[14px] text-charcoal bg-white border border-light-gray rounded-sm focus:outline-none focus:border-charcoal resize-y"
              style={{borderWidth:'0.5px'}} />
          </div>
          <div className="flex flex-col gap-2">
            <ImageUpload
              value={heroImage}
              onChange={setHeroImage}
              label="Hero image"
              hint="Choose a new image or paste a URL."
            />
          </div>
        </div>
      </div>

      <div className="bg-white border border-light-gray rounded-sm p-8" style={{borderWidth:'0.5px'}}>
        <h2 className="font-serif text-[16px] text-charcoal mb-6">Article body</h2>
        <RichTextEditor
          value={body}
          onChange={setBody}
          placeholder="Write your article here…"
          minHeight={400}
        />
      </div>

      <div className="bg-white border border-light-gray rounded-sm p-8" style={{borderWidth:'0.5px'}}>
        <h2 className="font-serif text-[16px] text-charcoal mb-6">Arabic Translation <span className="font-normal text-taupe">(optional)</span></h2>
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label className="font-sans text-[13px] font-medium text-charcoal">Title (AR)</label>
            <input type="text" value={titleAr} onChange={e => setTitleAr(e.target.value)} dir="rtl" lang="ar" className={`w-full ${ic}`} style={{fontFamily: 'var(--font-arabic)', borderWidth:'0.5px'}} />
          </div>
          <div className="flex flex-col gap-2">
            <label className="font-sans text-[13px] font-medium text-charcoal">Summary (AR)</label>
            <textarea value={summaryAr} onChange={e => setSummaryAr(e.target.value)} rows={3} dir="rtl" lang="ar"
              className="w-full p-4 font-sans text-[14px] text-charcoal bg-white border border-light-gray rounded-sm focus:outline-none focus:border-charcoal resize-y"
              style={{fontFamily: 'var(--font-arabic)', borderWidth:'0.5px'}} />
          </div>
          <div className="flex flex-col gap-2">
            <label className="font-sans text-[13px] font-medium text-charcoal">Body (AR)</label>
            <RichTextEditor
              value={bodyAr}
              onChange={setBodyAr}
              placeholder="اكتب مقالتك هنا…"
              minHeight={400}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
