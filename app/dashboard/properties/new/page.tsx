'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import ImageUpload from '@/components/ImageUpload'
import { DashboardAccessDenied } from '@/components/dashboard/DashboardAccessDenied'
import { hasAnyPermission } from '@/lib/rbac'

type SaveState = 'idle' | 'saving' | 'error'

const STATUS_OPTIONS = ['For Sale', 'For Rent', 'New Development']
const TYPE_OPTIONS = ['Apartment', 'Estate', 'Penthouse', 'Townhouse', 'Villa']

const ic = 'w-full h-[44px] px-4 font-sans text-[14px] text-charcoal bg-white border border-light-gray rounded-sm focus:outline-none focus:border-charcoal'
const sc = 'w-full h-[44px] px-4 font-sans text-[14px] text-charcoal bg-white border border-light-gray rounded-sm focus:outline-none focus:border-charcoal appearance-none'

export default function DashboardNewPropertyPage() {
  const router = useRouter()
  const { data: session, status: sessionStatus } = useSession()
  const canCreate = hasAnyPermission(session?.user?.permissions ?? [], ['properties.create'])

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [status, setStatus] = useState(STATUS_OPTIONS[0])
  const [type, setType] = useState(TYPE_OPTIONS[0])
  const [neighbourhood, setNeighbourhood] = useState('')
  const [address, setAddress] = useState('')
  const [bedrooms, setBedrooms] = useState('1')
  const [bathrooms, setBathrooms] = useState('1')
  const [area, setArea] = useState('')
  const [listingExpiresAt, setListingExpiresAt] = useState('')
  const [heroImage, setHeroImage] = useState('')
  const [featuresText, setFeaturesText] = useState('')
  const [published, setPublished] = useState(false)
  const [titleAr, setTitleAr] = useState('')
  const [descriptionAr, setDescriptionAr] = useState('')
  const [featuresArText, setFeaturesArText] = useState('')

  const [saveState, setSaveState] = useState<SaveState>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  if (sessionStatus === 'loading') {
    return (
      <div className="max-w-4xl mx-auto pt-12 text-center">
        <p className="font-sans text-[14px] text-taupe">Loading property editor…</p>
      </div>
    )
  }

  if (!canCreate) {
    return <DashboardAccessDenied message="You do not have permission to create properties." />
  }

  const handleSave = async () => {
    if (!title.trim()) {
      setErrorMsg('Title is required.')
      return
    }

    if (!price.trim()) {
      setErrorMsg('Price is required.')
      return
    }

    setSaveState('saving')
    setErrorMsg('')

    const features = featuresText
      .split('\n')
      .map(item => item.trim())
      .filter(Boolean)

    const featuresAr = featuresArText
      .split('\n')
      .map(item => item.trim())
      .filter(Boolean)

    try {
      const res = await fetch('/api/properties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || null,
          price: price.trim(),
          status,
          type,
          neighbourhood: neighbourhood.trim(),
          address: address.trim(),
          bedrooms: Number(bedrooms) || 0,
          bathrooms: Number(bathrooms) || 0,
          area: area.trim(),
          listingExpiresAt: listingExpiresAt || null,
          features,
          titleAr: titleAr.trim() || null,
          descriptionAr: descriptionAr.trim() || null,
          featuresAr: featuresAr.length > 0 ? featuresAr : [],
          images: heroImage ? [heroImage] : [],
          isPublished: published,
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to save property.')
      }

      const property = await res.json()
      router.push(`/dashboard/properties/${property.id}`)
    } catch (e: unknown) {
      setErrorMsg(e instanceof Error ? e.message : 'Failed to save property. Please try again.')
      setSaveState('error')
      setTimeout(() => setSaveState('idle'), 3000)
    }
  }

  return (
    <div className="max-w-4xl mx-auto pb-24">
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link href="/dashboard/properties" className="font-sans text-[13px] text-taupe hover:text-charcoal no-underline">Properties</Link>
            <span className="text-taupe">/</span>
            <span className="font-sans text-[13px] text-charcoal">New property</span>
          </div>
          <h1 className="font-serif text-[28px] text-charcoal">Add new property</h1>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <div
              className={`w-10 h-5 rounded-full relative transition-colors ${published ? 'bg-charcoal' : 'bg-light-gray'}`}
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
            {saveState === 'saving' ? 'Saving…' : 'Save property'}
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
          <ImageUpload
            value={heroImage}
            onChange={setHeroImage}
            label="Hero / listing image"
            hint="Choose the main image for this property."
            aspectClass="aspect-video"
          />
        </Section>

        <Section title="Basic information">
          <div className="space-y-5">
            <F label="Property title *">
              <input value={title} onChange={e => setTitle(e.target.value)} type="text" className={ic} style={{ borderWidth: '0.5px' }} />
            </F>
            <F label="Description">
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={5}
                className="w-full p-4 font-sans text-[14px] text-charcoal bg-white border border-light-gray rounded-sm focus:outline-none focus:border-charcoal resize-y"
                style={{ borderWidth: '0.5px' }}
              />
            </F>
          </div>
        </Section>

        <Section title="Listing details">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <F label="Price *">
              <input value={price} onChange={e => setPrice(e.target.value)} type="text" placeholder="e.g. $2,500,000" className={ic} style={{ borderWidth: '0.5px' }} />
            </F>
            <F label="Status">
              <select value={status} onChange={e => setStatus(e.target.value)} className={sc} style={{ borderWidth: '0.5px' }}>
                {STATUS_OPTIONS.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </F>
            <F label="Property type">
              <select value={type} onChange={e => setType(e.target.value)} className={sc} style={{ borderWidth: '0.5px' }}>
                {TYPE_OPTIONS.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </F>
            <F label="Neighbourhood">
              <input value={neighbourhood} onChange={e => setNeighbourhood(e.target.value)} type="text" placeholder="e.g. Downtown" className={ic} style={{ borderWidth: '0.5px' }} />
            </F>
            <div className="sm:col-span-2">
              <F label="Full address">
                <input value={address} onChange={e => setAddress(e.target.value)} type="text" placeholder="e.g. 42 Luxury Avenue, Suite 4" className={ic} style={{ borderWidth: '0.5px' }} />
              </F>
            </div>
          </div>
        </Section>

        <Section title="Specifications">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
            <F label="Bedrooms">
              <input value={bedrooms} onChange={e => setBedrooms(e.target.value)} type="number" min="0" className={ic} style={{ borderWidth: '0.5px' }} />
            </F>
            <F label="Bathrooms">
              <input value={bathrooms} onChange={e => setBathrooms(e.target.value)} type="number" min="0" step="0.5" className={ic} style={{ borderWidth: '0.5px' }} />
            </F>
            <F label="Area">
              <input value={area} onChange={e => setArea(e.target.value)} type="text" placeholder="e.g. 320 sqm" className={ic} style={{ borderWidth: '0.5px' }} />
            </F>
            <F label="Listing expiry">
              <input value={listingExpiresAt} onChange={e => setListingExpiresAt(e.target.value)} type="date" className={ic} style={{ borderWidth: '0.5px' }} />
            </F>
          </div>
          <p className="font-sans text-[12px] text-taupe mt-3">Optional. Used by the dashboard to flag listings that are expiring soon.</p>
        </Section>

        <Section title="Features & amenities">
          <F label="Features (one per line)">
            <textarea
              value={featuresText}
              onChange={e => setFeaturesText(e.target.value)}
              rows={6}
              placeholder={'Rooftop terrace\nHeated pool\nSmart home system\nWine cellar'}
              className="w-full p-4 font-sans text-[14px] text-charcoal bg-white border border-light-gray rounded-sm focus:outline-none focus:border-charcoal resize-y"
              style={{ borderWidth: '0.5px' }}
            />
          </F>
          <p className="font-sans text-[12px] text-taupe mt-2">Each line becomes a separate feature bullet point.</p>
        </Section>

        <Section title="Arabic Translation (optional)">
          <div className="space-y-5">
            <F label="Title (AR)">
              <input value={titleAr} onChange={e => setTitleAr(e.target.value)} type="text" dir="rtl" lang="ar" style={{ fontFamily: 'var(--font-arabic)', borderWidth: '0.5px' }} className={ic} />
            </F>
            <F label="Description (AR)">
              <textarea
                value={descriptionAr}
                onChange={e => setDescriptionAr(e.target.value)}
                rows={5}
                dir="rtl"
                lang="ar"
                className="w-full p-4 font-sans text-[14px] text-charcoal bg-white border border-light-gray rounded-sm focus:outline-none focus:border-charcoal resize-y"
                style={{ fontFamily: 'var(--font-arabic)', borderWidth: '0.5px' }}
              />
            </F>
            <F label="Features (AR, one per line)">
              <textarea
                value={featuresArText}
                onChange={e => setFeaturesArText(e.target.value)}
                rows={6}
                dir="rtl"
                lang="ar"
                placeholder="الميزات بالعربية..."
                className="w-full p-4 font-sans text-[14px] text-charcoal bg-white border border-light-gray rounded-sm focus:outline-none focus:border-charcoal resize-y"
                style={{ fontFamily: 'var(--font-arabic)', borderWidth: '0.5px' }}
              />
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
