import React from 'react'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { getServerLocale } from '@/lib/locale-server'
import { localise } from '@/lib/i18n'
import {
  SERVICES_CTA_DEFAULTS,
  SERVICE_SECTION_DEFAULTS,
  SERVICES_INDEX_DEFAULT_KEYS,
  parseCtaContent,
  parseServiceSectionContent,
  parseServicesHeaderContent,
  parseServicesIndexContent,
  toContentMap,
} from '@/lib/site-content'

export const revalidate = 60

export default async function ServicesPage() {
  const locale = await getServerLocale()
  let contentMap = toContentMap([])
  let serviceKeys = SERVICES_INDEX_DEFAULT_KEYS

  try {
    const indexAndMeta = await prisma.siteContent.findMany({
      where: { key: { in: ['services_header', 'services_index', 'services_cta'] } },
    })
    contentMap = toContentMap(indexAndMeta)
    const { keys } = parseServicesIndexContent(contentMap.get('services_index'))
    serviceKeys = keys
    const serviceRows = await prisma.siteContent.findMany({ where: { key: { in: serviceKeys } } })
    contentMap = toContentMap([...indexAndMeta, ...serviceRows])
  } catch {}

  const _header = contentMap.get('services_header')
  const _cta    = contentMap.get('services_cta')

  const headerContent = parseServicesHeaderContent(_header)
  const ctaContent    = parseCtaContent(_cta, SERVICES_CTA_DEFAULTS)

  if (locale === 'ar') {
    headerContent.title    = localise(headerContent.title,    _header?.titleAr,    locale)
    headerContent.subtitle = localise(headerContent.subtitle, _header?.subtitleAr, locale)
    ctaContent.title    = localise(ctaContent.title,    _cta?.titleAr,    locale)
    ctaContent.subtitle = localise(ctaContent.subtitle, _cta?.subtitleAr, locale)
    ctaContent.linkText = localise(ctaContent.linkText, _cta?.linkTextAr, locale)
  }

  const services = serviceKeys.map((key, index) => {
    const fallback = SERVICE_SECTION_DEFAULTS[index % SERVICE_SECTION_DEFAULTS.length] ?? SERVICE_SECTION_DEFAULTS[0]
    const defaultWithKey = { ...fallback, key, reverse: index % 2 === 1 }
    const svc = parseServiceSectionContent(contentMap.get(key), defaultWithKey)
    const raw = contentMap.get(key)
    if (locale === 'ar' && raw) {
      svc.title = localise(svc.title, raw.titleAr, locale)
      // bodyAr contains JSON { paragraphs, points }
      if (raw.bodyAr) {
        try {
          const parsed = JSON.parse(raw.bodyAr) as { paragraphs?: string[]; points?: string[] }
          if (parsed.paragraphs?.length) svc.paragraphs = parsed.paragraphs
          if (parsed.points?.length)     svc.points     = parsed.points
        } catch {}
      }
    }
    return svc
  })

  return (
    <main className="w-full bg-white">
      <section className="bg-cream py-16 px-4 md:px-8">
        <div className="max-w-[1200px] mx-auto">
          <h1 className="font-serif text-[40px] md:text-[48px] text-charcoal leading-[1.1] mb-4">{headerContent.title}</h1>
          <p className="font-sans text-[16px] text-taupe">{headerContent.subtitle}</p>
        </div>
      </section>

      {services.map((svc, idx) => {
        const isReverse = !!svc.reverse
        return (
          <section key={svc.key} className={`py-16 md:py-24 px-4 md:px-8 ${idx % 2 === 1 ? 'bg-cream' : ''}`}>
            <div className={`max-w-[1200px] mx-auto flex flex-col ${isReverse ? 'md:flex-row-reverse' : 'md:flex-row'} gap-12 items-center`}>
              <div className="w-full md:w-1/2">
                <h2 className="font-serif text-[32px] text-charcoal leading-[1.15] mb-6">{svc.title}</h2>
                <div className="font-sans text-[14px] text-taupe leading-[1.7] space-y-5 mb-8">
                  {svc.paragraphs.map((p:string,i:number)=><p key={i}>{p}</p>)}
                </div>
                <ul className="space-y-3 mb-8">
                  {svc.points.map((pt,i)=>(
                    <li key={i} className="flex items-start gap-3 font-sans text-[14px] text-taupe">
                      <span className="w-4 h-4 rounded-full bg-gold/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <svg width="8" height="8" viewBox="0 0 12 12" fill="none" stroke="#D4AF37" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 6l3 3 5-5"/></svg>
                      </span>
                      {pt}
                    </li>
                  ))}
                </ul>
                <Link href="/contact" className="inline-block bg-gold hover:bg-gold-dark text-charcoal font-sans text-[14px] font-medium px-7 py-3 rounded-full transition-colors no-underline">
                  {locale === 'ar' ? 'ناقش متطلباتك' : 'Discuss your requirements'}
                </Link>
              </div>
              <div className="w-full md:w-1/2 overflow-hidden rounded-sm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={svc.image} alt={svc.title} className="w-full h-[420px] object-cover" />
              </div>
            </div>
          </section>
        )
      })}

      <section className="py-8 md:py-12 bg-cream px-4 md:px-8 text-center">
        <div className="max-w-[600px] mx-auto">
          <h2 className="font-serif text-[32px] text-charcoal mb-4">{ctaContent.title}</h2>
          <p className="font-sans text-[15px] text-taupe mb-8">{ctaContent.subtitle}</p>
          <Link href={ctaContent.linkUrl} className="inline-block bg-gold hover:bg-gold-dark text-charcoal font-sans text-[14px] font-medium px-8 py-3.5 rounded-full transition-colors no-underline">
            {ctaContent.linkText}
          </Link>
        </div>
      </section>
    </main>
  )
}
