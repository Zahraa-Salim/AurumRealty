'use client'

import React, { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import ImageUpload from '@/components/ImageUpload'
import { DashboardAccessDenied } from '@/components/dashboard/DashboardAccessDenied'
import {
  ABOUT_CTA_DEFAULTS,
  ABOUT_STORY_DEFAULTS,
  ABOUT_TEAM_DEFAULTS,
  ABOUT_VALUES_DEFAULTS,
  parseAboutStoryContent,
  parseAboutTeamContent,
  parseAboutValuesContent,
  parseCtaContent,
  toAboutStoryEntry,
  toAboutTeamEntry,
  toAboutValuesEntry,
  toContentMap,
  toCtaEntry,
  type AboutStoryContent,
  type AboutTeamContent,
  type AboutTeamMember,
  type AboutValuesContent,
  type CtaContent,
} from '@/lib/site-content'
import { hasAnyPermission } from '@/lib/rbac'

const inputCls = 'w-full h-[40px] px-3 font-sans text-[13px] text-charcoal bg-white border border-light-gray rounded-sm focus:outline-none focus:border-charcoal'
const textAreaCls = 'w-full p-3 font-sans text-[13px] text-charcoal bg-white border border-light-gray rounded-sm focus:outline-none focus:border-charcoal resize-y'

export default function DashboardAboutEditorPage() {
  const { data: session, status } = useSession()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [story, setStory] = useState<AboutStoryContent>(ABOUT_STORY_DEFAULTS)
  const [team, setTeam] = useState<AboutTeamContent>(ABOUT_TEAM_DEFAULTS)
  const [values, setValues] = useState<AboutValuesContent>(ABOUT_VALUES_DEFAULTS)
  const [cta, setCta] = useState<CtaContent>(ABOUT_CTA_DEFAULTS)

  const [storyAr, setStoryAr] = useState({ titleAr: '', subtitleAr: '', paragraphsAr: [] as string[] })
  const [ctaAr, setCtaAr] = useState({ titleAr: '', subtitleAr: '', linkTextAr: '' })
  const canEdit = hasAnyPermission(session?.user?.permissions ?? [], ['pages.edit'])

  useEffect(() => {
    if (status !== 'authenticated' || !canEdit) {
      return
    }

    async function load() {
      try {
        const res = await fetch('/api/site-content')
        if (!res.ok) {
          throw new Error('Failed to load about page content.')
        }

        const items = await res.json()
        const contentMap = toContentMap(items)

        const storyContent = parseAboutStoryContent(contentMap.get('about_story'))
        const ctaContent = parseCtaContent(contentMap.get('about_cta'), ABOUT_CTA_DEFAULTS)

        setStory(storyContent)
        setTeam(parseAboutTeamContent(contentMap.get('about_team')))
        setValues(parseAboutValuesContent(contentMap.get('about_values')))
        setCta(ctaContent)

        // Read Arabic fields from raw DB records
        const storyRaw = contentMap.get('about_story')
        const ctaRaw   = contentMap.get('about_cta')

        let paragraphsAr: string[] = []
        if (storyRaw?.bodyAr) {
          try {
            const parsed = JSON.parse(storyRaw.bodyAr) as { paragraphs?: string[] }
            if (Array.isArray(parsed?.paragraphs)) paragraphsAr = parsed.paragraphs
          } catch {
            paragraphsAr = storyRaw.bodyAr.split('\n\n').filter(Boolean)
          }
        }

        setStoryAr({
          titleAr:      storyRaw?.titleAr    ?? '',
          subtitleAr:   storyRaw?.subtitleAr ?? '',
          paragraphsAr,
        })

        setCtaAr({
          titleAr:    ctaRaw?.titleAr    ?? '',
          subtitleAr: ctaRaw?.subtitleAr ?? '',
          linkTextAr: ctaRaw?.linkTextAr ?? '',
        })
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Failed to load about page content.')
      } finally {
        setLoading(false)
      }
    }

    void load()
  }, [canEdit, status])

  if (status === 'loading') {
    return <EditorState message="Loading about editor…" />
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
          { ...toAboutStoryEntry(story), titleAr: storyAr.titleAr || null, subtitleAr: storyAr.subtitleAr || null, bodyAr: storyAr.paragraphsAr.filter(Boolean).length > 0 ? JSON.stringify({ paragraphs: storyAr.paragraphsAr.filter(Boolean) }) : null },
          toAboutTeamEntry(team),
          toAboutValuesEntry(values),
          { ...toCtaEntry('about_cta', cta), titleAr: ctaAr.titleAr || null, subtitleAr: ctaAr.subtitleAr || null, linkTextAr: ctaAr.linkTextAr || null },
        ]),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to save about page content.')
      }

      setSuccess('About page content updated.')
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Failed to save about page content.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <EditorState message="Loading about editor…" />
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-24">
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

      <Section title="About page header and story">
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Page title">
              <input
                type="text"
                value={story.title}
                onChange={(event) => setStory((current) => ({ ...current, title: event.target.value }))}
                className={inputCls}
                style={{ borderWidth: '0.5px' }}
              />
            </Field>
            <Field label="Page subtitle">
              <input
                type="text"
                value={story.subtitle}
                onChange={(event) => setStory((current) => ({ ...current, subtitle: event.target.value }))}
                className={inputCls}
                style={{ borderWidth: '0.5px' }}
              />
            </Field>
          </div>

          <ImageUpload
            value={story.image}
            onChange={(value) => setStory((current) => ({ ...current, image: value }))}
            label="Story image"
            hint="Choose the image displayed beside the story."
          />

          <ParagraphListEditor
            label="Story paragraphs"
            paragraphs={story.paragraphs}
            onChange={(paragraphs) => setStory((current) => ({ ...current, paragraphs }))}
          />
        </div>
      </Section>

      <Section title="About page header and story - Arabic (optional)">
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Page title (AR)">
              <input
                type="text"
                value={storyAr.titleAr}
                onChange={(event) => setStoryAr((current) => ({ ...current, titleAr: event.target.value }))}
                dir="rtl"
                lang="ar"
                className={inputCls}
                style={{ fontFamily: 'var(--font-arabic)', borderWidth: '0.5px' }}
              />
            </Field>
            <Field label="Page subtitle (AR)">
              <input
                type="text"
                value={storyAr.subtitleAr}
                onChange={(event) => setStoryAr((current) => ({ ...current, subtitleAr: event.target.value }))}
                dir="rtl"
                lang="ar"
                className={inputCls}
                style={{ fontFamily: 'var(--font-arabic)', borderWidth: '0.5px' }}
              />
            </Field>
          </div>

          <div>
            <label className="font-sans text-[13px] font-medium text-charcoal mb-3 block">Story paragraphs (AR)</label>
            <div className="space-y-3">
              {storyAr.paragraphsAr.map((paragraph, index) => (
                <div key={`story-ar-${index}`} className="space-y-2">
                  <textarea
                    rows={4}
                    value={paragraph}
                    onChange={(event) =>
                      setStoryAr((current) => ({
                        ...current,
                        paragraphsAr: current.paragraphsAr.map((item, itemIndex) =>
                          itemIndex === index ? event.target.value : item
                        ),
                      }))
                    }
                    dir="rtl"
                    lang="ar"
                    className={textAreaCls}
                    style={{ fontFamily: 'var(--font-arabic)', borderWidth: '0.5px' }}
                  />
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() =>
                        setStoryAr((current) => ({
                          ...current,
                          paragraphsAr: current.paragraphsAr.filter((_, itemIndex) => itemIndex !== index),
                        }))
                      }
                      disabled={storyAr.paragraphsAr.length === 1}
                      className="font-sans text-[12px] text-taupe hover:text-error bg-transparent border-none cursor-pointer disabled:opacity-40"
                    >
                      Remove paragraph
                    </button>
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={() => setStoryAr((current) => ({ ...current, paragraphsAr: [...current.paragraphsAr, ''] }))}
                className="px-4 py-2 rounded-full font-sans text-[13px] font-medium text-charcoal bg-transparent border border-charcoal hover:bg-light-gray/20 transition-colors"
                style={{ borderWidth: '0.5px' }}
              >
                Add paragraph (AR)
              </button>
            </div>
          </div>
        </div>
      </Section>

      <Section title="Team members">
        <div className="space-y-4">
          <Field label="Section title">
            <input
              type="text"
              value={team.title}
              onChange={(event) => setTeam((current) => ({ ...current, title: event.target.value }))}
              className={inputCls}
              style={{ borderWidth: '0.5px' }}
            />
          </Field>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {team.members.map((member, index) => (
              <div key={`team-member-${index}`} className="p-5 border border-light-gray rounded-sm bg-light-gray/5 space-y-4" style={{ borderWidth: '0.5px' }}>
                <ImageUpload
                  value={member.image}
                  onChange={(value) => updateTeamMember(index, { image: value })}
                  label="Photo"
                  hint="Optional. If left empty, initials will be shown."
                  aspectClass="aspect-square"
                />

                <Field label="Name">
                  <input
                    type="text"
                    value={member.name}
                    onChange={(event) => updateTeamMember(index, { name: event.target.value })}
                    className={inputCls}
                    style={{ borderWidth: '0.5px' }}
                  />
                </Field>

                <Field label="Role">
                  <input
                    type="text"
                    value={member.role}
                    onChange={(event) => updateTeamMember(index, { role: event.target.value })}
                    className={inputCls}
                    style={{ borderWidth: '0.5px' }}
                  />
                </Field>

                <Field label="Bio">
                  <textarea
                    rows={5}
                    value={member.bio}
                    onChange={(event) => updateTeamMember(index, { bio: event.target.value })}
                    className={textAreaCls}
                    style={{ borderWidth: '0.5px' }}
                  />
                </Field>
              </div>
            ))}
          </div>
        </div>
      </Section>

      <Section title="Values">
        <div className="space-y-4">
          <Field label="Section title">
            <input
              type="text"
              value={values.title}
              onChange={(event) => setValues((current) => ({ ...current, title: event.target.value }))}
              className={inputCls}
              style={{ borderWidth: '0.5px' }}
            />
          </Field>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {values.items.map((item, index) => (
              <div key={`value-item-${index}`} className="space-y-3">
                <Field label="Title">
                  <input
                    type="text"
                    value={item.label}
                    onChange={(event) =>
                      setValues((current) => ({
                        ...current,
                        items: current.items.map((currentItem, currentIndex) =>
                          currentIndex === index ? { ...currentItem, label: event.target.value } : currentItem
                        ),
                      }))
                    }
                    className={inputCls}
                    style={{ borderWidth: '0.5px' }}
                  />
                </Field>
                <Field label="Body">
                  <textarea
                    rows={5}
                    value={item.desc}
                    onChange={(event) =>
                      setValues((current) => ({
                        ...current,
                        items: current.items.map((currentItem, currentIndex) =>
                          currentIndex === index ? { ...currentItem, desc: event.target.value } : currentItem
                        ),
                      }))
                    }
                    className={textAreaCls}
                    style={{ borderWidth: '0.5px' }}
                  />
                </Field>
              </div>
            ))}
          </div>
        </div>
      </Section>

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

      <Section title="Final CTA - Arabic (optional)">
        <div className="space-y-4">
          <Field label="Headline (AR)">
            <input
              type="text"
              value={ctaAr.titleAr}
              onChange={(event) => setCtaAr((current) => ({ ...current, titleAr: event.target.value }))}
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
              onChange={(event) => setCtaAr((current) => ({ ...current, subtitleAr: event.target.value }))}
              dir="rtl"
              lang="ar"
              className={textAreaCls}
              style={{ fontFamily: 'var(--font-arabic)', borderWidth: '0.5px' }}
            />
          </Field>
          <Field label="Button label (AR)">
            <input
              type="text"
              value={ctaAr.linkTextAr}
              onChange={(event) => setCtaAr((current) => ({ ...current, linkTextAr: event.target.value }))}
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

  function updateTeamMember(index: number, patch: Partial<AboutTeamMember>) {
    setTeam((current) => ({
      ...current,
      members: current.members.map((member, memberIndex) =>
        memberIndex === index ? { ...member, ...patch } : member
      ),
    }))
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
    <div className="space-y-3">
      <label className="font-sans text-[13px] font-medium text-charcoal">{label}</label>
      {paragraphs.map((paragraph, index) => (
        <div key={`${label}-${index}`} className="space-y-2">
          <textarea
            rows={4}
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
