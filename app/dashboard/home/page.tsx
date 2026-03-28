'use client'

import React, { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import ImageUpload from '@/components/ImageUpload'
import { DashboardAccessDenied } from '@/components/dashboard/DashboardAccessDenied'
import {
  HOME_ABOUT_DEFAULTS,
  HOME_CTA_DEFAULTS,
  HOME_HERO_DEFAULTS,
  HOME_JOURNAL_DEFAULTS,
  HOME_SERVICES_DEFAULTS,
  parseHomeAboutContent,
  parseHomeCtaContent,
  parseHomeFeaturedPropertiesContent,
  parseHomeHeroContent,
  parseHomeJournalContent,
  parseHomeServicesContent,
  toContentMap,
  toHomeAboutEntry,
  toHomeCtaEntry,
  toHomeFeaturedPropertiesEntry,
  toHomeHeroEntry,
  toHomeJournalEntry,
  toHomeServicesEntry,
  type HomeAboutContent,
  type HomeCtaContent,
  type HomeHeroContent,
  type HomeJournalContent,
  type HomeServicesContent,
} from '@/lib/site-content'
import { hasAnyPermission } from '@/lib/rbac'

type PropertyOption = {
  id: number
  title: string
  price: string
  isPublished: boolean
}

const inputCls = 'w-full h-[44px] px-4 font-sans text-[14px] text-charcoal bg-white border border-light-gray rounded-sm focus:outline-none focus:border-charcoal'
const textAreaCls = 'w-full p-4 font-sans text-[14px] text-charcoal bg-white border border-light-gray rounded-sm focus:outline-none focus:border-charcoal resize-y'

export default function DashboardHomeEditorPage() {
  const { data: session, status } = useSession()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [properties, setProperties] = useState<PropertyOption[]>([])

  const [hero, setHero] = useState<HomeHeroContent>(HOME_HERO_DEFAULTS)
  const [featuredPropertyIds, setFeaturedPropertyIds] = useState<number[]>([])
  const [services, setServices] = useState<HomeServicesContent>(HOME_SERVICES_DEFAULTS)
  const [about, setAbout] = useState<HomeAboutContent>(HOME_ABOUT_DEFAULTS)
  const [journal, setJournal] = useState<HomeJournalContent>(HOME_JOURNAL_DEFAULTS)
  const [cta, setCta] = useState<HomeCtaContent>(HOME_CTA_DEFAULTS)
  const [heroAr, setHeroAr] = useState({ title: '', subtitle: '', linkText: '' })
  const [servicesAr, setServicesAr] = useState({ title: '', subtitle: '' })
  const [aboutAr, setAboutAr] = useState({ title: '', subtitle: '', body: '' })
  const [ctaAr, setCtaAr] = useState({ title: '', subtitle: '', linkText: '' })
  const canEdit = hasAnyPermission(session?.user?.permissions ?? [], ['pages.edit'])

  useEffect(() => {
    if (status !== 'authenticated' || !canEdit) {
      return
    }

    async function load() {
      try {
        const [contentRes, propertiesRes] = await Promise.all([
          fetch('/api/site-content'),
          fetch('/api/properties?all=true'),
        ])

        if (!contentRes.ok || !propertiesRes.ok) {
          throw new Error('Failed to load homepage content.')
        }

        const [contentItems, propertyItems] = await Promise.all([
          contentRes.json(),
          propertiesRes.json(),
        ])

        const contentMap = toContentMap(contentItems)
        const heroContent = parseHomeHeroContent(contentMap.get('home_hero'))
        const servicesContent = parseHomeServicesContent(contentMap.get('home_services'))
        const aboutContent = parseHomeAboutContent(contentMap.get('home_about'))
        const ctaContent = parseHomeCtaContent(contentMap.get('home_cta'))

        setHero(heroContent)
        setFeaturedPropertyIds(parseHomeFeaturedPropertiesContent(contentMap.get('home_featured_properties')).propertyIds)
        setServices(servicesContent)
        setAbout(aboutContent)
        setJournal(parseHomeJournalContent(contentMap.get('home_journal')))
        setCta(ctaContent)

        setHeroAr({
          title: (heroContent as any).titleAr ?? '',
          subtitle: (heroContent as any).subtitleAr ?? '',
          linkText: (heroContent as any).linkTextAr ?? ''
        })
        setServicesAr({
          title: (servicesContent as any).titleAr ?? '',
          subtitle: (servicesContent as any).subtitleAr ?? ''
        })
        setAboutAr({
          title: (aboutContent as any).titleAr ?? '',
          subtitle: (aboutContent as any).subtitleAr ?? '',
          body: (aboutContent as any).bodyAr ?? ''
        })
        setCtaAr({
          title: (ctaContent as any).titleAr ?? '',
          subtitle: (ctaContent as any).subtitleAr ?? '',
          linkText: (ctaContent as any).linkTextAr ?? ''
        })
        setProperties(Array.isArray(propertyItems) ? propertyItems : [])
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Failed to load homepage content.')
      } finally {
        setLoading(false)
      }
    }

    void load()
  }, [canEdit, status])

  if (status === 'loading') {
    return <EditorState message="Loading homepage editor…" />
  }

  if (!canEdit) {
    return <DashboardAccessDenied message="You do not have permission to edit website pages." />
  }

  const handleSave = async () => {
    if (featuredPropertyIds.length > 3) {
      setError('Choose at most 3 featured properties.')
      return
    }

    setSaving(true)
    setError('')
    setSuccess('')

    try {
      const res = await fetch('/api/site-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify([
          { ...toHomeHeroEntry(hero), titleAr: heroAr.title || null, subtitleAr: heroAr.subtitle || null, linkTextAr: heroAr.linkText || null },
          toHomeFeaturedPropertiesEntry({ propertyIds: featuredPropertyIds }),
          { ...toHomeServicesEntry(services), titleAr: servicesAr.title || null, subtitleAr: servicesAr.subtitle || null },
          { ...toHomeAboutEntry(about), titleAr: aboutAr.title || null, subtitleAr: aboutAr.subtitle || null, bodyAr: aboutAr.body || null },
          toHomeJournalEntry(journal),
          { ...toHomeCtaEntry(cta), titleAr: ctaAr.title || null, subtitleAr: ctaAr.subtitle || null, linkTextAr: ctaAr.linkText || null },
        ]),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to save homepage content.')
      }

      setSuccess('Homepage content updated.')
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Failed to save homepage content.')
    } finally {
      setSaving(false)
    }
  }

  const toggleFeaturedProperty = (propertyId: number) => {
    setFeaturedPropertyIds((current) => {
      if (current.includes(propertyId)) {
        return current.filter((id) => id !== propertyId)
      }

      if (current.length >= 3) {
        setError('You can feature up to 3 properties on the homepage.')
        return current
      }

      setError('')
      return [...current, propertyId]
    })
  }

  if (loading) {
    return <EditorState message="Loading homepage editor…" />
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-24">
      <div className="flex justify-end mb-8">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-8 py-2.5 rounded-full font-sans text-[13px] font-medium text-charcoal bg-gold hover:bg-gold-dark transition-colors border-none cursor-pointer disabled:opacity-60"
        >
          {saving ? 'Saving…' : 'Save all changes'}
        </button>
      </div>

      {error && <Message tone="error" text={error} />}
      {success && <Message tone="success" text={success} />}

      <Section title="Hero section">
        <div className="space-y-4">
          <Field label="Headline">
            <input
              type="text"
              value={hero.title}
              onChange={(event) => setHero((current) => ({ ...current, title: event.target.value }))}
              className={inputCls}
              style={{ borderWidth: '0.5px' }}
            />
          </Field>
          <Field label="Subtitle">
            <textarea
              rows={3}
              value={hero.subtitle}
              onChange={(event) => setHero((current) => ({ ...current, subtitle: event.target.value }))}
              className={textAreaCls}
              style={{ borderWidth: '0.5px' }}
            />
          </Field>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="CTA button label">
              <input
                type="text"
                value={hero.linkText}
                onChange={(event) => setHero((current) => ({ ...current, linkText: event.target.value }))}
                className={inputCls}
                style={{ borderWidth: '0.5px' }}
              />
            </Field>
            <Field label="CTA link">
              <input
                type="text"
                value={hero.linkUrl}
                onChange={(event) => setHero((current) => ({ ...current, linkUrl: event.target.value }))}
                className={inputCls}
                style={{ borderWidth: '0.5px' }}
              />
            </Field>
          </div>
        </div>
      </Section>

      <Section title="Hero section - Arabic (optional)">
        <div className="space-y-4">
          <Field label="Headline (AR)">
            <input
              type="text"
              value={heroAr.title}
              onChange={(event) => setHeroAr((current) => ({ ...current, title: event.target.value }))}
              dir="rtl"
              lang="ar"
              className={inputCls}
              style={{ fontFamily: 'var(--font-arabic)', borderWidth: '0.5px' }}
            />
          </Field>
          <Field label="Subtitle (AR)">
            <textarea
              rows={3}
              value={heroAr.subtitle}
              onChange={(event) => setHeroAr((current) => ({ ...current, subtitle: event.target.value }))}
              dir="rtl"
              lang="ar"
              className={textAreaCls}
              style={{ fontFamily: 'var(--font-arabic)', borderWidth: '0.5px' }}
            />
          </Field>
          <Field label="CTA button label (AR)">
            <input
              type="text"
              value={heroAr.linkText}
              onChange={(event) => setHeroAr((current) => ({ ...current, linkText: event.target.value }))}
              dir="rtl"
              lang="ar"
              className={inputCls}
              style={{ fontFamily: 'var(--font-arabic)', borderWidth: '0.5px' }}
            />
          </Field>
        </div>
      </Section>

      <Section title="Featured properties">
        <p className="font-sans text-[13px] text-taupe mb-4">Choose up to 3 featured properties for the homepage.</p>
        <div className="border border-light-gray rounded-sm overflow-hidden max-h-[280px] overflow-y-auto" style={{ borderWidth: '0.5px' }}>
          {properties.map((property, index) => (
            <label
              key={property.id}
              className="flex items-center gap-3 p-4 border-b border-light-gray last:border-0 hover:bg-light-gray/10 cursor-pointer"
              style={{ borderWidth: index === properties.length - 1 ? '0' : '0 0 0.5px 0' }}
            >
              <input
                type="checkbox"
                checked={featuredPropertyIds.includes(property.id)}
                onChange={() => toggleFeaturedProperty(property.id)}
                className="rounded-sm"
              />
              <div className="flex-1">
                <p className="font-sans text-[14px] text-charcoal">{property.title}</p>
                <p className="font-sans text-[12px] text-taupe">{property.price} {property.isPublished ? '' : '· Draft'}</p>
              </div>
            </label>
          ))}
        </div>
      </Section>

      <Section title="Services section on homepage">
        <div className="space-y-4">
          <Field label="Headline">
            <input
              type="text"
              value={services.title}
              onChange={(event) => setServices((current) => ({ ...current, title: event.target.value }))}
              className={inputCls}
              style={{ borderWidth: '0.5px' }}
            />
          </Field>
          <Field label="Subtitle">
            <textarea
              rows={3}
              value={services.subtitle}
              onChange={(event) => setServices((current) => ({ ...current, subtitle: event.target.value }))}
              className={textAreaCls}
              style={{ borderWidth: '0.5px' }}
            />
          </Field>
          <p className="font-sans text-[12px] text-taupe italic">The three cards use the detailed content from the Services editor below.</p>
        </div>
      </Section>

      <Section title="Services section - Arabic (optional)">
        <div className="space-y-4">
          <Field label="Headline (AR)">
            <input
              type="text"
              value={servicesAr.title}
              onChange={(event) => setServicesAr((current) => ({ ...current, title: event.target.value }))}
              dir="rtl"
              lang="ar"
              className={inputCls}
              style={{ fontFamily: 'var(--font-arabic)', borderWidth: '0.5px' }}
            />
          </Field>
          <Field label="Subtitle (AR)">
            <textarea
              rows={3}
              value={servicesAr.subtitle}
              onChange={(event) => setServicesAr((current) => ({ ...current, subtitle: event.target.value }))}
              dir="rtl"
              lang="ar"
              className={textAreaCls}
              style={{ fontFamily: 'var(--font-arabic)', borderWidth: '0.5px' }}
            />
          </Field>
        </div>
      </Section>

      <Section title="About brief on homepage">
        <div className="space-y-5">
          <Field label="Headline">
            <input
              type="text"
              value={about.title}
              onChange={(event) => setAbout((current) => ({ ...current, title: event.target.value }))}
              className={inputCls}
              style={{ borderWidth: '0.5px' }}
            />
          </Field>

          <ImageUpload
            value={about.image}
            onChange={(value) => setAbout((current) => ({ ...current, image: value }))}
            label="Section image"
            hint="Choose the image shown beside the about brief."
          />

          <ParagraphListEditor
            label="Paragraphs"
            paragraphs={about.paragraphs}
            onChange={(paragraphs) => setAbout((current) => ({ ...current, paragraphs }))}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="CTA button label">
              <input
                type="text"
                value={about.linkText}
                onChange={(event) => setAbout((current) => ({ ...current, linkText: event.target.value }))}
                className={inputCls}
                style={{ borderWidth: '0.5px' }}
              />
            </Field>
            <Field label="CTA link">
              <input
                type="text"
                value={about.linkUrl}
                onChange={(event) => setAbout((current) => ({ ...current, linkUrl: event.target.value }))}
                className={inputCls}
                style={{ borderWidth: '0.5px' }}
              />
            </Field>
          </div>
        </div>
      </Section>

      <Section title="About brief - Arabic (optional)">
        <div className="space-y-4">
          <Field label="Headline (AR)">
            <input
              type="text"
              value={aboutAr.title}
              onChange={(event) => setAboutAr((current) => ({ ...current, title: event.target.value }))}
              dir="rtl"
              lang="ar"
              className={inputCls}
              style={{ fontFamily: 'var(--font-arabic)', borderWidth: '0.5px' }}
            />
          </Field>
          <Field label="Subtitle (AR)">
            <textarea
              rows={3}
              value={aboutAr.subtitle}
              onChange={(event) => setAboutAr((current) => ({ ...current, subtitle: event.target.value }))}
              dir="rtl"
              lang="ar"
              className={textAreaCls}
              style={{ fontFamily: 'var(--font-arabic)', borderWidth: '0.5px' }}
            />
          </Field>
          <Field label="Body (AR)">
            <textarea
              rows={4}
              value={aboutAr.body}
              onChange={(event) => setAboutAr((current) => ({ ...current, body: event.target.value }))}
              dir="rtl"
              lang="ar"
              className={textAreaCls}
              style={{ fontFamily: 'var(--font-arabic)', borderWidth: '0.5px' }}
            />
          </Field>
        </div>
      </Section>

      <Section title="Latest journal section">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Label">
            <input
              type="text"
              value={journal.label}
              onChange={(event) => setJournal((current) => ({ ...current, label: event.target.value }))}
              className={inputCls}
              style={{ borderWidth: '0.5px' }}
            />
          </Field>
          <Field label="Button label">
            <input
              type="text"
              value={journal.buttonText}
              onChange={(event) => setJournal((current) => ({ ...current, buttonText: event.target.value }))}
              className={inputCls}
              style={{ borderWidth: '0.5px' }}
            />
          </Field>
        </div>
      </Section>

      <Section title="Bottom CTA">
        <div className="space-y-4">
          <Field label="Headline">
            <input
              type="text"
              value={cta.title}
              onChange={(event) => setCta((current) => ({ ...current, title: event.target.value }))}
              className={inputCls}
              style={{ borderWidth: '0.5px' }}
            />
          </Field>
          <Field label="Subtitle">
            <textarea
              rows={3}
              value={cta.subtitle}
              onChange={(event) => setCta((current) => ({ ...current, subtitle: event.target.value }))}
              className={textAreaCls}
              style={{ borderWidth: '0.5px' }}
            />
          </Field>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Button label">
              <input
                type="text"
                value={cta.linkText}
                onChange={(event) => setCta((current) => ({ ...current, linkText: event.target.value }))}
                className={inputCls}
                style={{ borderWidth: '0.5px' }}
              />
            </Field>
            <Field label="Button link">
              <input
                type="text"
                value={cta.linkUrl}
                onChange={(event) => setCta((current) => ({ ...current, linkUrl: event.target.value }))}
                className={inputCls}
                style={{ borderWidth: '0.5px' }}
              />
            </Field>
          </div>
        </div>
      </Section>

      <Section title="Bottom CTA - Arabic (optional)">
        <div className="space-y-4">
          <Field label="Headline (AR)">
            <input
              type="text"
              value={ctaAr.title}
              onChange={(event) => setCtaAr((current) => ({ ...current, title: event.target.value }))}
              dir="rtl"
              lang="ar"
              className={inputCls}
              style={{ fontFamily: 'var(--font-arabic)', borderWidth: '0.5px' }}
            />
          </Field>
          <Field label="Subtitle (AR)">
            <textarea
              rows={3}
              value={ctaAr.subtitle}
              onChange={(event) => setCtaAr((current) => ({ ...current, subtitle: event.target.value }))}
              dir="rtl"
              lang="ar"
              className={textAreaCls}
              style={{ fontFamily: 'var(--font-arabic)', borderWidth: '0.5px' }}
            />
          </Field>
          <Field label="Button label (AR)">
            <input
              type="text"
              value={ctaAr.linkText}
              onChange={(event) => setCtaAr((current) => ({ ...current, linkText: event.target.value }))}
              dir="rtl"
              lang="ar"
              className={inputCls}
              style={{ fontFamily: 'var(--font-arabic)', borderWidth: '0.5px' }}
            />
          </Field>
        </div>
      </Section>
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

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="font-sans text-[13px] font-medium text-charcoal">{label}</label>
      {children}
    </div>
  )
}

function ParagraphListEditor({
  label,
  paragraphs,
  onChange,
}: {
  label: string
  paragraphs: string[]
  onChange: (paragraphs: string[]) => void
}) {
  return (
    <div className="space-y-3">
      <label className="font-sans text-[13px] font-medium text-charcoal">{label}</label>
      {paragraphs.map((paragraph, index) => (
        <div key={`${label}-${index}`} className="space-y-2">
          <textarea
            rows={3}
            value={paragraph}
            onChange={(event) =>
              onChange(paragraphs.map((item, itemIndex) => (itemIndex === index ? event.target.value : item)))
            }
            className={textAreaCls}
            style={{ borderWidth: '0.5px' }}
          />
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => onChange(paragraphs.filter((_, itemIndex) => itemIndex !== index))}
              disabled={paragraphs.length === 1}
              className="font-sans text-[12px] text-taupe hover:text-error bg-transparent border-none cursor-pointer disabled:opacity-40"
            >
              Remove paragraph
            </button>
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...paragraphs, ''])}
        className="px-4 py-2 rounded-full font-sans text-[13px] font-medium text-charcoal bg-transparent border border-charcoal hover:bg-light-gray/20 transition-colors"
        style={{ borderWidth: '0.5px' }}
      >
        Add paragraph
      </button>
    </div>
  )
}

function Message({ tone, text }: { tone: 'error' | 'success'; text: string }) {
  return (
    <div
      className={`px-4 py-3 rounded-sm font-sans text-[13px] ${
        tone === 'error' ? 'bg-error/5 text-error border border-error/20' : 'bg-success/10 text-success border border-success/20'
      }`}
      style={{ borderWidth: '0.5px' }}
    >
      {text}
    </div>
  )
}

function EditorState({ message }: { message: string }) {
  return (
    <div className="max-w-4xl mx-auto pt-12 text-center">
      <p className="font-sans text-[14px] text-taupe">{message}</p>
    </div>
  )
}
