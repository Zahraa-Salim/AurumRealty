import React from 'react'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { getServerLocale } from '@/lib/locale-server'
import { localise } from '@/lib/i18n'
import {
  ABOUT_CTA_DEFAULTS,
  ABOUT_TEAM_DEFAULTS,
  ABOUT_VALUES_DEFAULTS,
  getParagraphsFromBody,
  parseAboutStoryContent,
  parseAboutTeamContent,
  parseAboutValuesContent,
  parseCtaContent,
  toContentMap,
} from '@/lib/site-content'

export const revalidate = 60

export default async function AboutPage() {
  const locale = await getServerLocale()
  let contentMap = toContentMap([])
  try {
    const items = await prisma.siteContent.findMany({
      where: { key: { in: ['about_story', 'about_team', 'about_values', 'about_cta'] } },
    })
    contentMap = toContentMap(items)
  } catch {}

  const _story  = contentMap.get('about_story')
  const _team   = contentMap.get('about_team')
  const _values = contentMap.get('about_values')
  const _cta    = contentMap.get('about_cta')

  const storyContent  = parseAboutStoryContent(_story)
  const teamContent   = parseAboutTeamContent(_team)
  const valuesContent = parseAboutValuesContent(_values)
  const ctaContent    = parseCtaContent(_cta, ABOUT_CTA_DEFAULTS)

  // Cast to any to access AR fields until Prisma client is regenerated (same pattern as blog/[slug]/page.tsx)
  const _storyAny  = _story  as any
  const _teamAny   = _team   as any
  const _valuesAny = _values as any
  const _ctaAny    = _cta    as any

  // Apply Arabic overrides
  if (locale === 'ar') {
    storyContent.title      = localise(storyContent.title,    _storyAny?.titleAr,    locale)
    storyContent.subtitle   = localise(storyContent.subtitle, _storyAny?.subtitleAr, locale)
    storyContent.paragraphs = getParagraphsFromBody(_storyAny?.bodyAr, storyContent.paragraphs)
    ctaContent.title    = localise(ctaContent.title,    _ctaAny?.titleAr,    locale)
    ctaContent.subtitle = localise(ctaContent.subtitle, _ctaAny?.subtitleAr, locale)
    ctaContent.linkText = localise(ctaContent.linkText, _ctaAny?.linkTextAr, locale)
    // Use Arabic team members if available
    if (_teamAny?.bodyAr) {
      const arTeam = parseAboutTeamContent({ ..._team, body: _teamAny.bodyAr } as any)
      if (arTeam.members.length > 0) teamContent.members = arTeam.members
    }
    // Use Arabic values if available
    if (_valuesAny?.bodyAr) {
      const arVals = parseAboutValuesContent({ ..._values, body: _valuesAny.bodyAr } as any)
      if (arVals.items.length > 0) valuesContent.items = arVals.items
    }
  }

  const teamTitle   = locale === 'ar' ? localise(teamContent.title   || ABOUT_TEAM_DEFAULTS.title,   _teamAny?.titleAr,   locale) : (teamContent.title   || ABOUT_TEAM_DEFAULTS.title)
  const valuesTitle = locale === 'ar' ? localise(valuesContent.title || ABOUT_VALUES_DEFAULTS.title, _valuesAny?.titleAr, locale) : (valuesContent.title || ABOUT_VALUES_DEFAULTS.title)

  return (
    <main className="w-full bg-white">
      <section className="bg-cream py-16 px-4 md:px-8">
        <div className="max-w-[1200px] mx-auto">
          <h1 className="font-serif text-[40px] md:text-[48px] text-charcoal leading-[1.1] mb-4">{storyContent.title}</h1>
          <p className="font-sans text-[16px] text-taupe">{storyContent.subtitle}</p>
        </div>
      </section>

      <section className="py-16 md:py-24 px-4 md:px-8 max-w-[1200px] mx-auto">
        <div className="flex flex-col md:flex-row gap-12 items-center">
          <div className="w-full md:w-1/2 order-2 md:order-1">
            <h2 className="font-serif text-[32px] md:text-[40px] text-charcoal leading-[1.15] mb-6">
              {locale === 'ar' ? 'قصتنا' : 'Our story'}
            </h2>
            <div className="font-sans text-[14px] text-taupe leading-[1.7] space-y-5">
              {storyContent.paragraphs.map((p:string,i:number)=><p key={i}>{p}</p>)}
            </div>
          </div>
          <div className="w-full md:w-1/2 order-1 md:order-2 overflow-hidden rounded-sm">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={storyContent.image} alt="Aurum Realty office" className="w-full h-[420px] object-cover"/>
          </div>
        </div>
      </section>

      <section className="bg-cream py-16 md:py-24 px-4 md:px-8">
        <div className="max-w-[1200px] mx-auto">
          <h2 className="font-serif text-[32px] md:text-[40px] text-charcoal leading-[1.15] mb-12">
            {teamTitle}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {teamContent.members.map((m) => {
              return (
                <div key={m.name} className="bg-white p-8 rounded-sm" style={{borderWidth:'0.5px'}}>
                  {m.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={m.image} alt={m.name} className="w-16 h-16 rounded-full object-cover mb-5" />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-gold/20 flex items-center justify-center mb-5">
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#1F1F1F" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="8" r="4"/><path d="M4 20c0-3.3 3.6-6 8-6s8 2.7 8 6"/>
                      </svg>
                    </div>
                  )}
                  <h3 className="font-serif text-[20px] text-charcoal mb-1">{m.name}</h3>
                  <p className="font-sans text-[13px] text-taupe mb-4">{m.role}</p>
                  <p className="font-sans text-[13px] text-taupe leading-[1.7]">{m.bio}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 px-4 md:px-8 max-w-[1200px] mx-auto">
        <h2 className="font-serif text-[32px] md:text-[40px] text-charcoal leading-[1.15] mb-12">
          {valuesTitle}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {valuesContent.items.map(v=>(
            <div key={v.label}>
              <div className="w-10 h-[2px] bg-gold mb-5"/>
              <h3 className="font-serif text-[22px] text-charcoal mb-4">{v.label}</h3>
              <p className="font-sans text-[14px] text-taupe leading-[1.7]">{v.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-cream py-14 px-4 md:px-8 text-center">
        <div className="max-w-[600px] mx-auto">
          <h2 className="font-serif text-[28px] text-charcoal mb-4">{ctaContent.title}</h2>
          <p className="font-sans text-[14px] text-taupe mb-6">{ctaContent.subtitle}</p>
          <Link href={ctaContent.linkUrl} className="inline-block bg-gold hover:bg-gold-dark text-charcoal font-sans text-[14px] font-medium px-8 py-3.5 rounded-full transition-colors no-underline">
            {ctaContent.linkText}
          </Link>
        </div>
      </section>
    </main>
  )
}
