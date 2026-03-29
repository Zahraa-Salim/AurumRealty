'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import ImageUpload from '@/components/ImageUpload'
import { DashboardAccessDenied } from '@/components/dashboard/DashboardAccessDenied'
import {
  SERVICES_CTA_DEFAULTS,
  SERVICES_HEADER_DEFAULTS,
  SERVICE_SECTION_DEFAULTS,
  SERVICES_INDEX_DEFAULT_KEYS,
  parseCtaContent,
  parseServiceSectionContent,
  parseServicesHeaderContent,
  parseServicesIndexContent,
  toContentMap,
  toCtaEntry,
  toServiceSectionEntry,
  toServicesHeaderEntry,
  toServicesIndexEntry,
  type CtaContent,
  type ServiceSectionContent,
  type ServicesHeaderContent,
} from '@/lib/site-content'
import { hasAnyPermission } from '@/lib/rbac'

const inputCls = 'w-full h-[44px] px-4 font-sans text-[14px] text-charcoal bg-white border border-light-gray rounded-sm focus:outline-none focus:border-charcoal'
const textAreaCls = 'w-full p-4 font-sans text-[14px] text-charcoal bg-white border border-light-gray rounded-sm focus:outline-none focus:border-charcoal resize-y'

function makeDefaultService(key: string, index: number): ServiceSectionContent {
  const fallback = SERVICE_SECTION_DEFAULTS[index % SERVICE_SECTION_DEFAULTS.length]
  return {
    key,
    title: `Service ${index + 1}`,
    paragraphs: fallback?.paragraphs ?? ['Describe this service here.'],
    points: fallback?.points ?? ['Key benefit'],
    image: fallback?.image ?? '',
    reverse: index % 2 === 1,
  }
}

export default function DashboardServicesEditorPage() {
  const { data: session, status } = useSession()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [header, setHeader] = useState<ServicesHeaderContent>(SERVICES_HEADER_DEFAULTS)
  const [serviceKeys, setServiceKeys] = useState<string[]>(SERVICES_INDEX_DEFAULT_KEYS)
  const [services, setServices] = useState<ServiceSectionContent[]>(SERVICE_SECTION_DEFAULTS)
  const [cta, setCta] = useState<CtaContent>(SERVICES_CTA_DEFAULTS)

  const [headerAr, setHeaderAr] = useState({ titleAr: '', subtitleAr: '' })
  const [ctaAr, setCtaAr] = useState({ titleAr: '', subtitleAr: '', linkText: '' })
  const [servicesAr, setServicesAr] = useState<Record<string, { titleAr: string; paragraphsAr: string[] }>>({})

  const canEdit = hasAnyPermission(session?.user?.permissions ?? [], ['pages.edit'])

  useEffect(() => {
    if (status !== 'authenticated' || !canEdit) return

    async function load() {
      try {
        const res = await fetch('/api/site-content')
        if (!res.ok) throw new Error('Failed to load services content.')

        const items = await res.json()
        const contentMap = toContentMap(items)

        const headerContent = parseServicesHeaderContent(contentMap.get('services_header'))
        const ctaContent = parseCtaContent(contentMap.get('services_cta'), SERVICES_CTA_DEFAULTS)

        setHeader(headerContent)
        setCta(ctaContent)

        setHeaderAr({
          titleAr: (headerContent as any).titleAr ?? '',
          subtitleAr: (headerContent as any).subtitleAr ?? ''
        })

        setCtaAr({
          titleAr: (ctaContent as any).titleAr ?? '',
          subtitleAr: (ctaContent as any).subtitleAr ?? '',
          linkText: (ctaContent as any).linkTextAr ?? ''
        })

        const { keys } = parseServicesIndexContent(contentMap.get('services_index'))
        setServiceKeys(keys)

        const loadedServices = keys.map((key, index) => {
          const fallback = makeDefaultService(key, index)
          return parseServiceSectionContent(contentMap.get(key), fallback)
        })
        setServices(loadedServices)

        // Load Arabic translations for services
        const arMap: Record<string, { titleAr: string; paragraphsAr: string[] }> = {}
        keys.forEach((key) => {
          const content = contentMap.get(key)
          if (content) {
            let paragraphsAr: string[] = []
            if (content.bodyAr) {
              try {
                const parsed = JSON.parse(content.bodyAr) as { paragraphs?: string[] }
                if (Array.isArray(parsed?.paragraphs)) paragraphsAr = parsed.paragraphs
              } catch {
                // plain text fallback
                paragraphsAr = content.bodyAr.split('\n\n').filter(Boolean)
              }
            }
            arMap[key] = {
              titleAr: content.titleAr ?? '',
              paragraphsAr,
            }
          }
        })
        setServicesAr(arMap)
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Failed to load services content.')
      } finally {
        setLoading(false)
      }
    }

    void load()
  }, [canEdit, status])

  const updateService = useCallback((index: number, patch: Partial<ServiceSectionContent>) => {
    setServices(current =>
      current.map((service, i) => i === index ? { ...service, ...patch } : service)
    )
  }, [])

  if (status === 'loading') return <EditorState message="Loading services editor…" />
  if (!canEdit) return <DashboardAccessDenied message="You do not have permission to edit website pages." />
  if (loading) return <EditorState message="Loading services editor…" />

  const handleSave = async () => {
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      const res = await fetch('/api/site-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify([
          { ...toServicesHeaderEntry(header), titleAr: headerAr.titleAr || null, subtitleAr: headerAr.subtitleAr || null },
          toServicesIndexEntry({ keys: serviceKeys }),
          ...services.map((service) => {
            const ar = servicesAr[service.key] || { titleAr: '', paragraphsAr: [] }
            const cleanAr = ar.paragraphsAr.filter(Boolean)
            return {
              ...toServiceSectionEntry(service),
              titleAr: ar.titleAr || null,
              bodyAr: cleanAr.length > 0 ? JSON.stringify({ paragraphs: cleanAr }) : null,
            }
          }),
          { ...toCtaEntry('services_cta', cta), titleAr: ctaAr.titleAr || null, subtitleAr: ctaAr.subtitleAr || null, linkTextAr: ctaAr.linkText || null },
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

  const addService = () => {
    const nextNum = serviceKeys.length + 1
    let newKey = `service_${nextNum}`
    while (serviceKeys.includes(newKey)) {
      newKey = `service_${Date.now()}`
    }
    const newService = makeDefaultService(newKey, serviceKeys.length)
    setServiceKeys(current => [...current, newKey])
    setServices(current => [...current, newService])
  }

  const deleteService = async (index: number) => {
    const key = serviceKeys[index]
    setServiceKeys(current => current.filter((_, i) => i !== index))
    setServices(current => current.filter((_, i) => i !== index))
    // Best-effort delete from DB
    try {
      await fetch(`/api/site-content?key=${encodeURIComponent(key)}`, { method: 'DELETE' })
    } catch {
      // Row may not exist yet — ignore
    }
  }

  const moveService = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= serviceKeys.length) return
    setServiceKeys(current => {
      const arr = [...current]
      ;[arr[index], arr[newIndex]] = [arr[newIndex], arr[index]]
      return arr
    })
    setServices(current => {
      const arr = [...current]
      ;[arr[index], arr[newIndex]] = [arr[newIndex], arr[index]]
      return arr
    })
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

      {/* Page header section */}
      <Section title="Services page header">
        <div className="space-y-4">
          <Field label="Headline">
            <input
              type="text"
              value={header.title}
              onChange={(e) => setHeader(current => ({ ...current, title: e.target.value }))}
              className={inputCls}
              style={{ borderWidth: '0.5px' }}
            />
          </Field>
          <Field label="Subtitle">
            <textarea
              rows={3}
              value={header.subtitle}
              onChange={(e) => setHeader(current => ({ ...current, subtitle: e.target.value }))}
              className={textAreaCls}
              style={{ borderWidth: '0.5px' }}
            />
          </Field>
        </div>
      </Section>

      <Section title="Services page header - Arabic (optional)">
        <div className="space-y-4">
          <Field label="Headline (AR)">
            <input
              type="text"
              value={headerAr.titleAr}
              onChange={(e) => setHeaderAr(current => ({ ...current, titleAr: e.target.value }))}
              dir="rtl"
              lang="ar"
              className={inputCls}
              style={{ fontFamily: 'var(--font-arabic)', borderWidth: '0.5px' }}
            />
          </Field>
          <Field label="Subtitle (AR)">
            <textarea
              rows={3}
              value={headerAr.subtitleAr}
              onChange={(e) => setHeaderAr(current => ({ ...current, subtitleAr: e.target.value }))}
              dir="rtl"
              lang="ar"
              className={textAreaCls}
              style={{ fontFamily: 'var(--font-arabic)', borderWidth: '0.5px' }}
            />
          </Field>
        </div>
      </Section>

      {/* Dynamic service sections */}
      {services.map((service, index) => (
        <Section
          key={service.key}
          title={`Service ${index + 1}`}
          controls={
            <div className="flex items-center gap-2">
              <button
                onClick={() => moveService(index, 'up')}
                disabled={index === 0}
                className="w-8 h-8 flex items-center justify-center rounded-sm bg-light-gray/40 hover:bg-light-gray text-charcoal border-none cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed text-[16px]"
                title="Move up"
              >↑</button>
              <button
                onClick={() => moveService(index, 'down')}
                disabled={index === services.length - 1}
                className="w-8 h-8 flex items-center justify-center rounded-sm bg-light-gray/40 hover:bg-light-gray text-charcoal border-none cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed text-[16px]"
                title="Move down"
              >↓</button>
              <button
                onClick={() => deleteService(index)}
                disabled={services.length <= 1}
                className="px-3 py-1.5 rounded-sm font-sans text-[12px] font-medium text-error bg-error/5 hover:bg-error/10 border border-error/20 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                style={{ borderWidth: '0.5px' }}
              >
                Delete
              </button>
            </div>
          }
        >
          <div className="space-y-5">
            <Field label="Title">
              <input
                type="text"
                value={service.title}
                onChange={(e) => updateService(index, { title: e.target.value })}
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

            <div className="mt-8 pt-8 border-t border-light-gray" style={{ borderWidth: '0.5px' }}>
              <h3 className="font-serif text-[16px] text-charcoal mb-5">Arabic Translation (optional)</h3>
              <div className="space-y-5">
                <Field label="Title (AR)">
                  <input
                    type="text"
                    value={servicesAr[service.key]?.titleAr ?? ''}
                    onChange={(e) => setServicesAr(current => ({
                      ...current,
                      [service.key]: { ...current[service.key], titleAr: e.target.value }
                    }))}
                    dir="rtl"
                    lang="ar"
                    className={inputCls}
                    style={{ fontFamily: 'var(--font-arabic)', borderWidth: '0.5px' }}
                  />
                </Field>

                <div>
                  <label className="font-sans text-[13px] font-medium text-charcoal mb-3 block">Body paragraphs (AR)</label>
                  <div className="space-y-3">
                    {(servicesAr[service.key]?.paragraphsAr ?? []).map((para, paraIndex) => (
                      <div key={`${service.key}-para-${paraIndex}`}>
                        <div className="flex gap-2">
                          <textarea
                            rows={4}
                            value={para}
                            onChange={(e) => setServicesAr(current => {
                              const ar = current[service.key] || { titleAr: '', paragraphsAr: [] }
                              const newParagraphs = ar.paragraphsAr.map((p, i) => i === paraIndex ? e.target.value : p)
                              return {
                                ...current,
                                [service.key]: { ...ar, paragraphsAr: newParagraphs }
                              }
                            })}
                            dir="rtl"
                            lang="ar"
                            className="flex-1 p-4 font-sans text-[14px] text-charcoal bg-white border border-light-gray rounded-sm focus:outline-none focus:border-charcoal resize-y"
                            style={{ fontFamily: 'var(--font-arabic)', borderWidth: '0.5px' }}
                          />
                          <button
                            type="button"
                            onClick={() => setServicesAr(current => {
                              const ar = current[service.key] || { titleAr: '', paragraphsAr: [] }
                              const newParagraphs = ar.paragraphsAr.filter((_, i) => i !== paraIndex)
                              return {
                                ...current,
                                [service.key]: { ...ar, paragraphsAr: newParagraphs }
                              }
                            })}
                            disabled={(servicesAr[service.key]?.paragraphsAr ?? []).length === 1}
                            className="w-[40px] h-[40px] text-[18px] text-taupe hover:text-error bg-light-gray/20 border-none rounded-sm cursor-pointer disabled:opacity-40"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => setServicesAr(current => {
                        const ar = current[service.key] || { titleAr: '', paragraphsAr: [] }
                        return {
                          ...current,
                          [service.key]: { ...ar, paragraphsAr: [...ar.paragraphsAr, ''] }
                        }
                      })}
                      className="px-4 py-2 rounded-full font-sans text-[13px] font-medium text-charcoal bg-transparent border border-charcoal hover:bg-light-gray/20 transition-colors"
                      style={{ borderWidth: '0.5px' }}
                    >
                      Add paragraph (AR)
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Section>
      ))}

      {/* Add service */}
      <div className="flex justify-center">
        <button
          onClick={addService}
          className="flex items-center gap-2 px-6 py-3 rounded-full font-sans text-[13px] font-medium text-charcoal bg-white border border-charcoal hover:bg-light-gray/20 transition-colors cursor-pointer"
          style={{ borderWidth: '0.5px' }}
        >
          <span className="text-[18px] leading-none">+</span>
          Add service
        </button>
      </div>

      {/* Final CTA */}
      <Section title="Final CTA">
        <div className="space-y-4">
          <Field label="Headline">
            <input
              type="text"
              value={cta.title}
              onChange={(e) => setCta(current => ({ ...current, title: e.target.value }))}
              className={inputCls}
              style={{ borderWidth: '0.5px' }}
            />
          </Field>
          <Field label="Subtitle">
            <textarea
              rows={3}
              value={cta.subtitle}
              onChange={(e) => setCta(current => ({ ...current, subtitle: e.target.value }))}
              className={textAreaCls}
              style={{ borderWidth: '0.5px' }}
            />
          </Field>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Button label">
              <input
                type="text"
                value={cta.linkText}
                onChange={(e) => setCta(current => ({ ...current, linkText: e.target.value }))}
                className={inputCls}
                style={{ borderWidth: '0.5px' }}
              />
            </Field>
            <Field label="Button link">
              <input
                type="text"
                value={cta.linkUrl}
                onChange={(e) => setCta(current => ({ ...current, linkUrl: e.target.value }))}
                className={inputCls}
                style={{ borderWidth: '0.5px' }}
              />
            </Field>
          </div>
        </div>
      </Section>

      <Section title="Final CTA - Arabic (optional)">
        <div className="space-y-4">
          <Field label="Headline (AR)">
            <input
              type="text"
              value={ctaAr.titleAr}
              onChange={(e) => setCtaAr(current => ({ ...current, titleAr: e.target.value }))}
              dir="rtl"
              lang="ar"
              className={inputCls}
              style={{ fontFamily: 'var(--font-arabic)', borderWidth: '0.5px' }}
            />
          </Field>
          <Field label="Subtitle (AR)">
            <textarea
              rows={3}
              value={ctaAr.subtitleAr}
              onChange={(e) => setCtaAr(current => ({ ...current, subtitleAr: e.target.value }))}
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
              onChange={(e) => setCtaAr(current => ({ ...current, linkText: e.target.value }))}
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

function Section({
  title,
  children,
  controls,
}: {
  title: string
  children: React.ReactNode
  controls?: React.ReactNode
}) {
  return (
    <div className="bg-white border border-light-gray rounded-sm p-8" style={{ borderWidth: '0.5px' }}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-serif text-[20px] text-charcoal">{title}</h2>
        {controls && <div>{controls}</div>}
      </div>
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
        <div key={`${label}-${index}`}>
          <div className="flex gap-2">
            {multiline ? (
              <textarea
                rows={4}
                value={item}
                onChange={(e) => onChange(items.map((cur, i) => i === index ? e.target.value : cur))}
                className="flex-1 p-4 font-sans text-[14px] text-charcoal bg-white border border-light-gray rounded-sm focus:outline-none focus:border-charcoal resize-y"
                style={{ borderWidth: '0.5px' }}
              />
            ) : (
              <input
                type="text"
                value={item}
                onChange={(e) => onChange(items.map((cur, i) => i === index ? e.target.value : cur))}
                className="flex-1 h-[40px] px-3 font-sans text-[13px] text-charcoal bg-white border border-light-gray rounded-sm focus:outline-none focus:border-charcoal"
                style={{ borderWidth: '0.5px' }}
              />
            )}
            <button
              type="button"
              onClick={() => onChange(items.filter((_, i) => i !== index))}
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
        tone === 'error'
          ? 'bg-error/5 text-error border border-error/20'
          : 'bg-success/10 text-success border border-success/20'
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
