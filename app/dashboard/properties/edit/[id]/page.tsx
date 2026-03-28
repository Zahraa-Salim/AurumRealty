'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import ImageUpload from '@/components/ImageUpload'
import { DashboardAccessDenied } from '@/components/dashboard/DashboardAccessDenied'
import { hasAnyPermission } from '@/lib/rbac'

type SaveState = 'idle' | 'saving' | 'error'

const NEIGHBOURHOODS = ['Downtown Premium','Beachfront District','Arts Quarter','Historic District','Mountain View Estates','Westside Premium']
const STATUSES       = ['For Sale','For Rent','New Development']
const TYPES          = ['Estate','Villa','Penthouse','Townhouse','Apartment']
const AGENTS         = ['Sarah Johnson','Michael Chen','Emily Brooks']
const DETAIL_FIELDS: Array<{ label: string; key: 'bedrooms' | 'bathrooms' | 'area' | 'yearBuilt' | 'lotSize' }> = [
  { label: 'Bedrooms', key: 'bedrooms' },
  { label: 'Bathrooms', key: 'bathrooms' },
  { label: 'Area (sqft)', key: 'area' },
  { label: 'Year built', key: 'yearBuilt' },
  { label: 'Lot size', key: 'lotSize' },
]

export default function DashboardPropertyEditPage() {
  const router = useRouter()
  const { id } = useParams<{ id: string }>()
  const { data: session, status } = useSession()

  const [loading,    setLoading]    = useState(true)
  const [notFound,   setNotFound]   = useState(false)
  const [saveState,  setSaveState]  = useState<SaveState>('idle')
  const [errorMsg,   setErrorMsg]   = useState('')
  const [features,   setFeatures]   = useState<string[]>([])
  const [newFeature, setNewFeature] = useState('')
  const [images,     setImages]     = useState<string[]>([])

  const [form, setForm] = useState({
    title: '', price: '', address: '', neighbourhood: '', status: '',
    type: '', bedrooms: '', bathrooms: '', area: '', yearBuilt: '', lotSize: '',
    description: '', agentName: '', listingExpiresAt: '', isPublished: false,
    titleAr: '', descriptionAr: '',
  })
  const [featuresAr, setFeaturesAr] = useState<string[]>([])
  const [newFeatureAr, setNewFeatureAr] = useState('')
  const canEdit = hasAnyPermission(session?.user?.permissions ?? [], ['properties.edit'])

  useEffect(() => {
    if (status !== 'authenticated' || !canEdit) {
      return
    }

    fetch(`/api/properties/${id}`)
      .then(r => { if (!r.ok) throw new Error(); return r.json() })
      .then(d => {
        setForm({
          title: d.title ?? '', price: d.price ?? '', address: d.address ?? '',
          neighbourhood: d.neighbourhood ?? '', status: d.status ?? '',
          type: d.type ?? '', bedrooms: String(d.bedrooms ?? ''),
          bathrooms: String(d.bathrooms ?? ''), area: d.area ?? '',
          yearBuilt: d.yearBuilt ?? '', lotSize: d.lotSize ?? '',
          description: d.description ?? '', agentName: d.agentName ?? '',
          listingExpiresAt: d.listingExpiresAt ? String(d.listingExpiresAt).slice(0, 10) : '',
          isPublished: d.isPublished ?? false,
          titleAr: d.titleAr ?? '', descriptionAr: d.descriptionAr ?? '',
        })
        setFeatures(d.features ?? [])
        setFeaturesAr(d.featuresAr ?? [])
        setImages(d.images ?? [])
        setLoading(false)
      })
      .catch(() => { setNotFound(true); setLoading(false) })
  }, [canEdit, id, status])

  if (status === 'loading') {
    return (
      <div className="max-w-4xl mx-auto pt-12 text-center">
        <p className="font-sans text-[14px] text-taupe">Loading property editor…</p>
      </div>
    )
  }

  if (!canEdit) {
    return <DashboardAccessDenied message="You do not have permission to edit properties." />
  }

  const set = (k: string, v: string | boolean) => setForm(f => ({ ...f, [k]: v }))

  const addFeature = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && newFeature.trim()) {
      e.preventDefault(); setFeatures(f => [...f, newFeature.trim()]); setNewFeature('')
    }
  }

  const handleImageUrl = (e: React.KeyboardEvent<HTMLInputElement>, input: HTMLInputElement) => {
    if (e.key === 'Enter' && input.value.trim()) {
      e.preventDefault(); setImages(imgs => [...imgs, input.value.trim()]); input.value = ''
    }
  }

  const handleSave = async () => {
    if (!form.title || !form.price || !form.status || !form.type) {
      setErrorMsg('Title, price, status and type are required.'); return
    }
    setSaveState('saving'); setErrorMsg('')
    try {
      const res = await fetch(`/api/properties/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          bedrooms:  Number(form.bedrooms)  || 0,
          bathrooms: Number(form.bathrooms) || 0,
          features, featuresAr, images,
        }),
      })
      if (!res.ok) throw new Error()
      router.push(`/dashboard/properties/${id}`)
    } catch {
      setErrorMsg('Failed to save. Please try again.'); setSaveState('error')
    }
  }

  const ic = 'h-[44px] px-4 font-sans text-[14px] text-charcoal bg-white border border-light-gray rounded-sm focus:outline-none focus:border-charcoal focus:shadow-focus'

  if (loading) return <div className="max-w-5xl mx-auto pt-12 text-center"><p className="font-sans text-[14px] text-taupe">Loading property…</p></div>
  if (notFound) return <div className="max-w-5xl mx-auto pt-12 text-center"><p className="font-serif text-[20px] text-charcoal mb-2">Property not found</p><Link href="/dashboard/properties" className="font-sans text-[13px] text-taupe no-underline hover:text-charcoal">← Back to properties</Link></div>

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-24">
      <div className="flex items-center justify-between mb-6">
        <Link href="/dashboard/properties" className="flex items-center gap-2 font-sans text-[13px] text-taupe hover:text-charcoal no-underline transition-colors">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          All properties
        </Link>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <span className="font-sans text-[13px] font-medium text-taupe">Draft</span>
            <div className={`w-10 h-5 rounded-full relative transition-colors cursor-pointer ${form.isPublished ? 'bg-success' : 'bg-light-gray'}`}
              onClick={() => set('isPublished', !form.isPublished)}>
              <div className={`w-3 h-3 bg-white rounded-full absolute top-1 transition-transform ${form.isPublished ? 'translate-x-6' : 'translate-x-1'}`} />
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

      <S title="Basic info">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <F label="Title" span><input value={form.title} onChange={e => set('title', e.target.value)} type="text" className={`w-full ${ic}`} style={{borderWidth:'0.5px'}} /></F>
          <F label="Price"><input value={form.price} onChange={e => set('price', e.target.value)} type="text" className={`w-full ${ic}`} style={{borderWidth:'0.5px'}} /></F>
          <F label="Address"><input value={form.address} onChange={e => set('address', e.target.value)} type="text" className={`w-full ${ic}`} style={{borderWidth:'0.5px'}} /></F>
          <F label="Neighbourhood">
            <select value={form.neighbourhood} onChange={e => set('neighbourhood', e.target.value)} className={`w-full ${ic}`} style={{borderWidth:'0.5px'}}>
              <option value="">Select…</option>
              {NEIGHBOURHOODS.map(o => <option key={o}>{o}</option>)}
            </select>
          </F>
          <F label="Status">
            <select value={form.status} onChange={e => set('status', e.target.value)} className={`w-full ${ic}`} style={{borderWidth:'0.5px'}}>
              {STATUSES.map(o => <option key={o}>{o}</option>)}
            </select>
          </F>
          <F label="Type">
            <select value={form.type} onChange={e => set('type', e.target.value)} className={`w-full ${ic}`} style={{borderWidth:'0.5px'}}>
              {TYPES.map(o => <option key={o}>{o}</option>)}
            </select>
          </F>
        </div>
      </S>

      <S title="Details">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {DETAIL_FIELDS.map(({ label, key }) => (
            <F key={key} label={label}><input value={form[key]} onChange={e => set(key, e.target.value)} type="text" className={`w-full ${ic}`} style={{borderWidth:'0.5px'}} /></F>
          ))}
          <F label="Listing expiry">
            <input value={form.listingExpiresAt} onChange={e => set('listingExpiresAt', e.target.value)} type="date" className={`w-full ${ic}`} style={{borderWidth:'0.5px'}} />
          </F>
        </div>
        <p className="font-sans text-[12px] text-taupe mt-3">Optional. Used by the dashboard to surface listings expiring within the next 30 days.</p>
      </S>

      <S title="Description">
        <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={8}
          className="w-full p-4 font-sans text-[14px] text-charcoal bg-white border border-light-gray rounded-sm focus:outline-none focus:border-charcoal resize-y min-h-[150px]"
          style={{borderWidth:'0.5px'}} />
      </S>

      <S title="Features">
        <div className="flex flex-wrap gap-2 mb-3 min-h-[32px]">
          {features.map((f, i) => (
            <span key={i} className="inline-flex items-center gap-2 px-3 py-1.5 bg-cream text-charcoal font-sans text-[13px] rounded-sm">
              {f}<button onClick={() => setFeatures(a => a.filter((_, j) => j !== i))} className="text-taupe hover:text-charcoal border-none bg-transparent cursor-pointer p-0 text-[16px] leading-none">&times;</button>
            </span>
          ))}
        </div>
        <input type="text" placeholder="Type a feature and press Enter…" value={newFeature}
          onChange={e => setNewFeature(e.target.value)} onKeyDown={addFeature}
          className={`w-full md:w-[300px] ${ic}`} style={{borderWidth:'0.5px'}} />
      </S>

      <S title="Images">
        <p className="font-sans text-[13px] text-taupe mb-4">First image is the primary listing image.</p>
        <div className="mb-5">
          <ImageUpload
            value={images[0] ?? ''}
            onChange={(url) => {
              setImages(current => {
                if (!url) return current.slice(1)
                if (current.length === 0) return [url]
                return [url, ...current.slice(1)]
              })
            }}
            label="Primary image"
            hint="Choose a replacement image or paste a URL."
            aspectClass="aspect-[16/10]"
          />
        </div>
        <div className="flex flex-wrap gap-3 mb-4">
          {images.map((url, i) => (
            <div key={i} className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" className="w-24 h-16 object-cover rounded-sm border border-light-gray" style={{borderWidth:'0.5px'}} />
              {i === 0 && <span className="absolute top-1 left-1 bg-gold text-charcoal font-sans text-[10px] font-medium px-1.5 py-0.5 rounded-sm">Primary</span>}
              <button onClick={() => setImages(a => a.filter((_, j) => j !== i))}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-charcoal text-white rounded-full text-[12px] leading-none border-none cursor-pointer flex items-center justify-center">×</button>
            </div>
          ))}
        </div>
        <input type="url" placeholder="Paste image URL and press Enter…"
          onKeyDown={e => handleImageUrl(e, e.currentTarget)}
          className={`w-full md:w-[400px] ${ic}`} style={{borderWidth:'0.5px'}} />
      </S>

      <S title="Agent">
        <F label="Assign listing agent">
          <select value={form.agentName} onChange={e => set('agentName', e.target.value)} className={`w-full md:w-[300px] ${ic}`} style={{borderWidth:'0.5px'}}>
            <option value="">Select agent…</option>
            {AGENTS.map(a => <option key={a}>{a}</option>)}
          </select>
        </F>
      </S>

      <S title="Arabic Translation (optional)">
        <div className="space-y-6">
          <F label="Title (AR)">
            <input type="text" value={form.titleAr} onChange={e => set('titleAr', e.target.value)} dir="rtl" lang="ar" className={`w-full ${ic}`} style={{fontFamily: 'var(--font-arabic)', borderWidth:'0.5px'}} />
          </F>
          <F label="Description (AR)">
            <textarea
              value={form.descriptionAr}
              onChange={e => set('descriptionAr', e.target.value)}
              rows={5}
              dir="rtl"
              lang="ar"
              className="w-full p-4 font-sans text-[14px] text-charcoal bg-white border border-light-gray rounded-sm focus:outline-none focus:border-charcoal resize-y"
              style={{fontFamily: 'var(--font-arabic)', borderWidth:'0.5px'}}
            />
          </F>
          <div className="border-t border-light-gray pt-6">
            <p className="font-sans text-[13px] font-medium text-charcoal mb-4">Features (Arabic)</p>
            <div className="flex flex-wrap gap-2 mb-3">
              {featuresAr.map((f, i) => (
                <span key={i} className="inline-flex items-center gap-2 bg-cream/50 px-3 py-1.5 rounded-full" dir="rtl">
                  <span className="font-sans text-[13px] text-charcoal">{f}</span>
                  <button onClick={() => setFeaturesAr(a => a.filter((_, j) => j !== i))} className="text-taupe hover:text-error text-[14px]">×</button>
                </span>
              ))}
            </div>
            <input type="text" dir="rtl" lang="ar" placeholder="الميزات بالعربية…" value={newFeatureAr}
              onChange={e => setNewFeatureAr(e.target.value)} onKeyDown={(e) => {
                if (e.key === 'Enter' && newFeatureAr.trim()) {
                  e.preventDefault(); setFeaturesAr(f => [...f, newFeatureAr.trim()]); setNewFeatureAr('')
                }
              }}
              className={`w-full md:w-[300px] ${ic}`} style={{fontFamily: 'var(--font-arabic)', borderWidth:'0.5px'}} />
          </div>
        </div>
      </S>
    </div>
  )
}

function S({ title, children }: { title: string; children: React.ReactNode }) {
  return <div className="bg-white border border-light-gray rounded-sm p-8" style={{borderWidth:'0.5px'}}><h2 className="font-serif text-[16px] text-charcoal mb-6">{title}</h2>{children}</div>
}
function F({ label, children, span }: { label: string; children: React.ReactNode; span?: boolean }) {
  return <div className={`flex flex-col gap-2 ${span ? 'col-span-1 md:col-span-2' : ''}`}><label className="font-sans text-[13px] font-medium text-charcoal">{label}</label>{children}</div>
}
