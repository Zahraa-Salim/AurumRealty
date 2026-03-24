'use client'

import React, { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { DashboardAccessDenied } from '@/components/dashboard/DashboardAccessDenied'
import {
  CONTACT_PAGE_DEFAULTS,
  SEO_DEFAULTS,
  SITE_SETTINGS_GENERAL_DEFAULTS,
  SITE_SETTINGS_HOURS_DEFAULTS,
  SITE_SETTINGS_SOCIAL_DEFAULTS,
  parseContactPageContent,
  parseSeoDefaultsContent,
  parseSiteSettingsGeneralContent,
  parseSiteSettingsHoursContent,
  parseSiteSettingsSocialContent,
  toContactPageEntry,
  toContentMap,
  toSeoDefaultsEntry,
  toSiteSettingsGeneralEntry,
  toSiteSettingsHoursEntry,
  toSiteSettingsSocialEntry,
  type ContactPageContent,
  type SeoDefaultsContent,
  type SiteSettingsGeneralContent,
  type SiteSettingsHoursContent,
  type SiteSettingsHoursRow,
  type SiteSettingsSocialContent,
  type SiteSettingsSocialLink,
} from '@/lib/site-content'
import { hasAnyPermission } from '@/lib/rbac'

const inputCls = 'w-full h-[44px] px-4 font-sans text-[14px] text-charcoal bg-white border border-light-gray rounded-sm focus:outline-none focus:border-charcoal'
const textAreaCls = 'w-full p-4 font-sans text-[14px] text-charcoal bg-white border border-light-gray rounded-sm focus:outline-none focus:border-charcoal resize-y'

export default function DashboardSiteSettingsPage() {
  const { data: session, status } = useSession()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [contactPage, setContactPage] = useState<ContactPageContent>(CONTACT_PAGE_DEFAULTS)
  const [general, setGeneral] = useState<SiteSettingsGeneralContent>(SITE_SETTINGS_GENERAL_DEFAULTS)
  const [social, setSocial] = useState<SiteSettingsSocialContent>(SITE_SETTINGS_SOCIAL_DEFAULTS)
  const [hours, setHours] = useState<SiteSettingsHoursContent>(SITE_SETTINGS_HOURS_DEFAULTS)
  const [seoDefaults, setSeoDefaults] = useState<SeoDefaultsContent>(SEO_DEFAULTS)
  const canView = hasAnyPermission(session?.user?.permissions ?? [], ['settings.view'])

  useEffect(() => {
    if (status !== 'authenticated' || !canView) {
      return
    }

    async function load() {
      try {
        const res = await fetch('/api/site-content')
        if (!res.ok) {
          throw new Error('Failed to load site settings.')
        }

        const items = await res.json()
        const contentMap = toContentMap(items)

        setContactPage(parseContactPageContent(contentMap.get('contact_page')))
        setGeneral(parseSiteSettingsGeneralContent(contentMap.get('site_settings_general')))
        setSocial(parseSiteSettingsSocialContent(contentMap.get('site_settings_social')))
        setHours(parseSiteSettingsHoursContent(contentMap.get('site_settings_hours')))
        setSeoDefaults(parseSeoDefaultsContent(contentMap.get('seo_defaults')))
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Failed to load site settings.')
      } finally {
        setLoading(false)
      }
    }

    void load()
  }, [canView, status])

  if (status === 'loading') {
    return <EditorState message="Loading site settings…" />
  }

  if (!canView) {
    return <DashboardAccessDenied message="You do not have permission to view site settings." />
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
          toContactPageEntry(contactPage),
          toSiteSettingsGeneralEntry(general),
          toSiteSettingsSocialEntry(social),
          toSiteSettingsHoursEntry(hours),
          toSeoDefaultsEntry(seoDefaults),
        ]),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to save site settings.')
      }

      setSuccess('Site settings updated.')
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Failed to save site settings.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <EditorState message="Loading site settings…" />
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

      <Section title="Contact page header">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Page title">
            <input
              type="text"
              value={contactPage.title}
              onChange={(event) => setContactPage((current) => ({ ...current, title: event.target.value }))}
              className={inputCls}
              style={{ borderWidth: '0.5px' }}
            />
          </Field>
          <Field label="Page subtitle">
            <input
              type="text"
              value={contactPage.subtitle}
              onChange={(event) => setContactPage((current) => ({ ...current, subtitle: event.target.value }))}
              className={inputCls}
              style={{ borderWidth: '0.5px' }}
            />
          </Field>
        </div>
      </Section>

      <Section title="General contact info">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Company name">
            <input
              type="text"
              value={general.companyName}
              onChange={(event) => setGeneral((current) => ({ ...current, companyName: event.target.value }))}
              className={inputCls}
              style={{ borderWidth: '0.5px' }}
            />
          </Field>
          <Field label="Tagline">
            <input
              type="text"
              value={general.tagline}
              onChange={(event) => setGeneral((current) => ({ ...current, tagline: event.target.value }))}
              className={inputCls}
              style={{ borderWidth: '0.5px' }}
            />
          </Field>
          <Field label="Contact email">
            <input
              type="email"
              value={general.contactEmail}
              onChange={(event) => setGeneral((current) => ({ ...current, contactEmail: event.target.value }))}
              className={inputCls}
              style={{ borderWidth: '0.5px' }}
            />
          </Field>
          <Field label="Phone number">
            <input
              type="tel"
              value={general.phone}
              onChange={(event) => setGeneral((current) => ({ ...current, phone: event.target.value }))}
              className={inputCls}
              style={{ borderWidth: '0.5px' }}
            />
          </Field>
        </div>

        <div className="mt-5">
          <StringListEditor
            label="Address lines"
            items={general.addressLines}
            onChange={(addressLines) => setGeneral((current) => ({ ...current, addressLines }))}
            addLabel="Add address line"
          />
        </div>
      </Section>

      <Section title="Social links">
        <SocialLinksEditor
          items={social.links}
          onChange={(links) => setSocial({ links })}
          addLabel="Add social link"
        />
      </Section>

      <Section title="Office hours">
        <HoursRowsEditor
          items={hours.rows}
          onChange={(rows) => setHours({ rows })}
          addLabel="Add hours row"
        />
      </Section>

      <Section title="SEO defaults">
        <div className="space-y-4">
          <Field label="Meta title template">
            <input
              type="text"
              value={seoDefaults.titleTemplate}
              onChange={(event) => setSeoDefaults((current) => ({ ...current, titleTemplate: event.target.value }))}
              className={inputCls}
              style={{ borderWidth: '0.5px' }}
            />
          </Field>
          <Field label="Default meta description">
            <textarea
              rows={4}
              value={seoDefaults.description}
              onChange={(event) => setSeoDefaults((current) => ({ ...current, description: event.target.value }))}
              className={textAreaCls}
              style={{ borderWidth: '0.5px' }}
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

function StringListEditor({
  label,
  items,
  onChange,
  addLabel,
}: {
  label: string
  items: string[]
  onChange: (items: string[]) => void
  addLabel: string
}) {
  return (
    <div className="space-y-3">
      <label className="font-sans text-[13px] font-medium text-charcoal">{label}</label>
      {items.map((item, index) => (
        <div key={`${label}-${index}`} className="flex gap-2">
          <input
            type="text"
            value={item}
            onChange={(event) =>
              onChange(items.map((current, currentIndex) => (currentIndex === index ? event.target.value : current)))
            }
            className="flex-1 h-[44px] px-4 font-sans text-[14px] text-charcoal bg-white border border-light-gray rounded-sm focus:outline-none focus:border-charcoal"
            style={{ borderWidth: '0.5px' }}
          />
          <button
            type="button"
            onClick={() => onChange(items.filter((_, currentIndex) => currentIndex !== index))}
            disabled={items.length === 1}
            className="w-[44px] h-[44px] text-[18px] text-taupe hover:text-error bg-light-gray/20 border-none rounded-sm cursor-pointer disabled:opacity-40"
          >
            ×
          </button>
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

function SocialLinksEditor({
  items,
  onChange,
  addLabel,
}: {
  items: SiteSettingsSocialLink[]
  onChange: (items: SiteSettingsSocialLink[]) => void
  addLabel: string
}) {
  return (
    <div className="space-y-4">
      {items.map((item, index) => (
        <div key={`social-link-${index}`} className="grid grid-cols-1 md:grid-cols-[1fr_1.5fr_auto] gap-3 items-end">
          <Field label="Label">
            <input
              type="text"
              placeholder="Instagram"
              value={item.label}
              onChange={(event) =>
                onChange(
                  items.map((current, currentIndex) =>
                    currentIndex === index ? { ...current, label: event.target.value } : current
                  )
                )
              }
              className={inputCls}
              style={{ borderWidth: '0.5px' }}
            />
          </Field>
          <Field label="URL">
            <input
              type="text"
              placeholder="https://instagram.com/yourbrand"
              value={item.url}
              onChange={(event) =>
                onChange(
                  items.map((current, currentIndex) =>
                    currentIndex === index ? { ...current, url: event.target.value } : current
                  )
                )
              }
              className={inputCls}
              style={{ borderWidth: '0.5px' }}
            />
          </Field>
          <button
            type="button"
            onClick={() => onChange(items.filter((_, currentIndex) => currentIndex !== index))}
            disabled={items.length === 1}
            className="w-[44px] h-[44px] text-[18px] text-taupe hover:text-error bg-light-gray/20 border-none rounded-sm cursor-pointer disabled:opacity-40"
          >
            ×
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={() => onChange([...items, { label: '', url: '' }])}
        className="px-4 py-2 rounded-full font-sans text-[13px] font-medium text-charcoal bg-transparent border border-charcoal hover:bg-light-gray/20 transition-colors"
        style={{ borderWidth: '0.5px' }}
      >
        {addLabel}
      </button>
    </div>
  )
}

function HoursRowsEditor({
  items,
  onChange,
  addLabel,
}: {
  items: SiteSettingsHoursRow[]
  onChange: (items: SiteSettingsHoursRow[]) => void
  addLabel: string
}) {
  return (
    <div className="space-y-4">
      {items.map((item, index) => (
        <div key={`hours-row-${index}`} className="grid grid-cols-1 md:grid-cols-[1fr_1.5fr_auto] gap-3 items-end">
          <Field label="Label">
            <input
              type="text"
              placeholder="Monday"
              value={item.label}
              onChange={(event) =>
                onChange(
                  items.map((current, currentIndex) =>
                    currentIndex === index ? { ...current, label: event.target.value } : current
                  )
                )
              }
              className={inputCls}
              style={{ borderWidth: '0.5px' }}
            />
          </Field>
          <Field label="Hours">
            <input
              type="text"
              placeholder="9am - 6pm"
              value={item.value}
              onChange={(event) =>
                onChange(
                  items.map((current, currentIndex) =>
                    currentIndex === index ? { ...current, value: event.target.value } : current
                  )
                )
              }
              className={inputCls}
              style={{ borderWidth: '0.5px' }}
            />
          </Field>
          <button
            type="button"
            onClick={() => onChange(items.filter((_, currentIndex) => currentIndex !== index))}
            disabled={items.length === 1}
            className="w-[44px] h-[44px] text-[18px] text-taupe hover:text-error bg-light-gray/20 border-none rounded-sm cursor-pointer disabled:opacity-40"
          >
            ×
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={() => onChange([...items, { label: '', value: '' }])}
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
