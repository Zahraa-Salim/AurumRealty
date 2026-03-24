'use client'

import React, { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import ImageUpload from '@/components/ImageUpload'
import { DashboardAccessDenied } from '@/components/dashboard/DashboardAccessDenied'
import {
  SERVICES_CTA_DEFAULTS,
  SERVICES_HEADER_DEFAULTS,
  SERVICE_SECTION_DEFAULTS,
  parseCtaContent,
  parseServiceSectionContent,
  parseServicesHeaderContent,
  toContentMap,
  toCtaEntry,
  toServiceSectionEntry,
  toServicesHeaderEntry,
  type CtaContent,
  type ServiceSectionContent,
  type ServicesHeaderContent,
} from '@/lib/site-content'
import { hasAnyPermission } from '@/lib/rbac'

const inputCls = 'w-full h-[44px] px-4 font-sans text-[14px] text-charcoal bg-white border border-light-gray rounded-sm focus:outline-none focus:border-charcoal'
const textAreaCls = 'w-full p-4 font-sans text-[14px] text-charcoal bg-white border border-light-gray rounded-sm focus:outline-none focus:border-charcoal resize-y'

export default function DashboardServicesEditorPage() {
  const { data: session, status } = useSession()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [header, setHeader] = useState<ServicesHeaderContent>(SERVICES_HEADER_DEFAULTS)
  const [services, setServices] = useState<ServiceSectionContent[]>(SERVICE_SECTION_DEFAULTS)
  const [cta, setCta] = useState<CtaContent>(SERVICES_CTA_DEFAULTS)
  const canEdit = hasAnyPermission(session?.user?.permissions ?? [], ['pages.edit'])

  useEffect(() => {
    if (status !== 'authenticated' || !canEdit) {
      return
    }

    async function load() {
      try {
        const res = await fetch('/api/site-content')
        if (!res.ok) {
          throw new Error('Failed to load services content.')
        }

        const items = await res.json()
        const contentMap = toContentMap(items)

        setHeader(parseServicesHeaderContent(contentMap.get('services_header')))
        setServices(
          SERVICE_SECTION_DEFAULTS.map((defaults) =>
            parseServiceSectionContent(contentMap.get(defaults.key), defaults)
          )
        )
        setCta(parseCtaContent(contentMap.get('services_cta'), SERVICES_CTA_DEFAULTS))
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Failed to load services content.')
      } finally {
        setLoading(false)
      }
    }

    void load()
  }, [canEdit, status])

  if (status === 'loading') {
    return <EditorState message="Loading services editor…" />
  }

  if (!canEdit) {
    return <DashboardAccessDenied message="You do not have permission to edit website pages." />
  }

  const handleSave = async () => {
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      const res = await fetch('/api/site-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify([
          toServicesHeaderEntry(header),
          ...services.map((service) => toServiceSectionEntry(service)),
          toCtaEntry('services_cta', cta),
        ]),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to save services content.')
      }

      setSuccess('Services page content updated.')
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Failed to save services content.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <EditorState message="Loading services editor…" />
  }

  return (
    <div className="max-w-6xl mx-auto pb-24 space-y-8">
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

      <Section title="Services page header">
        <div className="space-y-4">
          <Field label="Headline">
            <input
              type="text"
              value={header.title}
              onChange={(event) => setHeader((current) => ({ ...current, title: event.target.value }))}
              className={inputCls}
              style={{ borderWidth: '0.5px' }}
            />
          </Field>
          <Field label="Subtitle">
            <textarea
              rows={3}
              value={header.subtitle}
              onChange={(event) => setHeader((current) => ({ ...current, subtitle: event.target.value }))}
              className={textAreaCls}
              style={{ borderWidth: '0.5px' }}
            />
          </Field>
        </div>
      </Section>

      {services.map((service, index) => (
        <Section key={service.key} title={`Service ${index + 1}`}>
          <div className="space-y-5">
            <Field label="Title">
              <input
                type="text"
                value={service.title}
                onChange={(event) => updateService(index, { title: event.target.value })}
                className={inputCls}
                style={{ borderWidth: '0.5px' }}
              />
            </Field>

            <ImageUpload
              value={service.image}
              onChange={(value) => updateService(index, { image: value })}
              label="Service image"
              hint="Choose the image for this service block."
            />

            <ParagraphListEditor
              label="Body paragraphs"
              paragraphs={service.paragraphs}
              onChange={(paragraphs) => updateService(index, { paragraphs })}
            />

            <StringListEditor
              label="Bullet points"
              items={service.points}
              onChange={(points) => updateService(index, { points })}
              addLabel="Add bullet point"
            />
          </div>
        </Section>
      ))}

      <Section title="Final CTA">
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
    </div>
  )

  function updateService(index: number, patch: Partial<ServiceSectionContent>) {
    setServices((current) =>
      current.map((service, serviceIndex) =>
        serviceIndex === index ? { ...service, ...patch } : service
      )
    )
  }
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
    <StringListEditor
      label={label}
      items={paragraphs}
      onChange={onChange}
      addLabel="Add paragraph"
      multiline
    />
  )
}

function StringListEditor({
  label,
  items,
  onChange,
  addLabel,
  multiline = false,
}: {
  label: string
  items: string[]
  onChange: (items: string[]) => void
  addLabel: string
  multiline?: boolean
}) {
  return (
    <div className="space-y-3">
      <label className="font-sans text-[13px] font-medium text-charcoal">{label}</label>
      {items.map((item, index) => (
        <div key={`${label}-${index}`} className="space-y-2">
          <div className="flex gap-2">
            {multiline ? (
              <textarea
                rows={4}
                value={item}
                onChange={(event) => onChange(items.map((current, currentIndex) => (currentIndex === index ? event.target.value : current)))}
                className="flex-1 p-4 font-sans text-[14px] text-charcoal bg-white border border-light-gray rounded-sm focus:outline-none focus:border-charcoal resize-y"
                style={{ borderWidth: '0.5px' }}
              />
            ) : (
              <input
                type="text"
                value={item}
                onChange={(event) => onChange(items.map((current, currentIndex) => (currentIndex === index ? event.target.value : current)))}
                className="flex-1 h-[40px] px-3 font-sans text-[13px] text-charcoal bg-white border border-light-gray rounded-sm focus:outline-none focus:border-charcoal"
                style={{ borderWidth: '0.5px' }}
              />
            )}
            <button
              type="button"
              onClick={() => onChange(items.filter((_, currentIndex) => currentIndex !== index))}
              disabled={items.length === 1}
              className="w-[40px] h-[40px] text-[18px] text-taupe hover:text-error bg-light-gray/20 border-none rounded-sm cursor-pointer disabled:opacity-40"
            >
              ×
            </button>
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...items, ''])}
        className="px-4 py-2 rounded-full font-sans text-[13px] font-medium text-charcoal bg-transparent border border-charcoal hover:bg-light-gray/20 transition-colors"
        style={{ borderWidth: '0.5px' }}
      >
        {addLabel}
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
