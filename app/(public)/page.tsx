/**
 * HomePage — /
 * Featured properties fetched from DB (first 3 published).
 * Latest blog post fetched for the journal teaser.
 * Hero text / CTA text comes from SiteContent table (key: "home_hero").
 * Falls back to defaults if DB content not set.
 */
import React from 'react'
import Link from 'next/link'
import type { BlogPost, Property } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { HomeParallaxImage } from '@/components/HomeParallaxImage'
import { HomeStatsBar } from '@/components/HomeStatsBar'
import { getServerLocale } from '@/lib/locale-server'
import { localise, localiseLabel, STATUS_AR, NEIGHBOURHOOD_AR } from '@/lib/i18n'
import {
  HOME_SERVICES_DEFAULTS,
  SERVICE_SECTION_DEFAULTS,
  SERVICES_INDEX_DEFAULT_KEYS,
  getParagraphsFromBody,
  parseHomeAboutContent,
  parseHomeCtaContent,
  parseHomeFeaturedPropertiesContent,
  parseHomeHeroContent,
  parseHomeJournalContent,
  parseHomeServicesContent,
  parseServiceSectionContent,
  parseServicesIndexContent,
  toContentMap,
} from '@/lib/site-content'

export const revalidate = 60

type HomeFeaturedProperty = Pick<
  Property,
  'id' | 'title' | 'titleAr' | 'price' | 'bedrooms' | 'bathrooms' | 'area' | 'images' | 'status' | 'neighbourhood'
>

type HomeLatestPost = Pick<
  BlogPost,
  'slug' | 'title' | 'titleAr' | 'topic' | 'heroImage' | 'readTime' | 'author'
>

export default async function HomePage() {
  const locale = await getServerLocale()
  let featured: HomeFeaturedProperty[] = []
  let latestPost: HomeLatestPost | null = null
  let homeSections = toContentMap([])
  let serviceCards = SERVICE_SECTION_DEFAULTS

  try {
    const [contentItems, latestPublishedProperties, latestPublishedPost] = await Promise.all([
      prisma.siteContent.findMany({
        where: {
          key: {
            in: [
              'home_hero',
              'home_services',
              'home_about',
              'home_journal',
              'home_cta',
              'home_featured_properties',
              'services_index',
            ],
          },
        },
      }),
      prisma.property.findMany({ where:{isPublished:true}, orderBy:{createdAt:'desc'}, take:3 }),
      prisma.blogPost.findFirst({ where:{isPublished:true}, orderBy:{publishedAt:'desc'}, select:{slug:true,title:true,titleAr:true,topic:true,heroImage:true,readTime:true,author:true} }),
    ])

    homeSections = toContentMap(contentItems)
    latestPost = latestPublishedPost

    // Resolve service keys from index, then fetch the actual rows
    const { keys: serviceKeys } = parseServicesIndexContent(homeSections.get('services_index'))
    const serviceRows = await prisma.siteContent.findMany({
      where: { key: { in: serviceKeys } },
    })
    const fullContentMap = toContentMap([...contentItems, ...serviceRows])

    serviceCards = serviceKeys.map((key, index) => {
      const fallback = SERVICE_SECTION_DEFAULTS[index % SERVICE_SECTION_DEFAULTS.length] ?? SERVICE_SECTION_DEFAULTS[0]
      const svc = parseServiceSectionContent(fullContentMap.get(key), { ...fallback, key })
      if (locale === 'ar') {
        const raw = fullContentMap.get(key)
        if (raw) {
          svc.title = localise(svc.title, raw.titleAr, locale)
          if (raw.bodyAr) {
            try {
              const parsed = JSON.parse(raw.bodyAr) as { paragraphs?: string[]; points?: string[] }
              if (parsed.paragraphs?.length) svc.paragraphs = parsed.paragraphs
              if (parsed.points?.length)     svc.points     = parsed.points
            } catch {}
          }
        }
      }
      return svc
    })

    const featuredContent = parseHomeFeaturedPropertiesContent(homeSections.get('home_featured_properties'))

    if (featuredContent.propertyIds.length > 0) {
      const selectedProperties = await prisma.property.findMany({
        where: {
          id: { in: featuredContent.propertyIds },
          isPublished: true,
        },
        select: {
          id: true,
          title: true,
          titleAr: true,
          price: true,
          bedrooms: true,
          bathrooms: true,
          area: true,
          images: true,
          status: true,
          neighbourhood: true,
        },
      })

      const selectedMap = new Map(selectedProperties.map((property) => [property.id, property]))
      featured = featuredContent.propertyIds
        .map((id) => selectedMap.get(id))
        .filter((property): property is HomeFeaturedProperty => property !== undefined)
    } else {
      featured = latestPublishedProperties
    }
  } catch {}

  const _hero    = homeSections.get('home_hero')
  const _about   = homeSections.get('home_about')
  const _services= homeSections.get('home_services')
  const _journal = homeSections.get('home_journal')
  const _cta     = homeSections.get('home_cta')

  const heroContent     = parseHomeHeroContent(_hero)
  const servicesContent = parseHomeServicesContent(_services)
  const aboutContent    = parseHomeAboutContent(_about)
  const journalContent  = parseHomeJournalContent(_journal)
  const ctaContent      = parseHomeCtaContent(_cta)

  // Apply Arabic overrides where available
  if (locale === 'ar') {
    heroContent.title    = localise(heroContent.title,    _hero?.titleAr,    locale)
    heroContent.subtitle = localise(heroContent.subtitle, _hero?.subtitleAr, locale)
    heroContent.linkText = localise(heroContent.linkText, _hero?.linkTextAr, locale)
    aboutContent.title      = localise(aboutContent.title,    _about?.titleAr,   locale)
    aboutContent.linkText   = localise(aboutContent.linkText, _about?.linkTextAr, locale)
    aboutContent.paragraphs = getParagraphsFromBody(_about?.bodyAr, aboutContent.paragraphs)
    servicesContent.title    = localise(servicesContent.title,    _services?.titleAr,    locale)
    servicesContent.subtitle = localise(servicesContent.subtitle, _services?.subtitleAr, locale)
    ctaContent.title    = localise(ctaContent.title,    _cta?.titleAr,    locale)
    ctaContent.subtitle = localise(ctaContent.subtitle, _cta?.subtitleAr, locale)
    ctaContent.linkText = localise(ctaContent.linkText, _cta?.linkTextAr, locale)
  }

  const statusBadge:Record<string,string> = {
    'For Sale':'bg-charcoal text-white','For Rent':'bg-gold text-charcoal','New Development':'bg-white/90 text-charcoal'
  }

  // Service icons — one per position, cycling if more services than icons
  const serviceIcons = [
    // Key icon — property sales
    <svg key="key" className="service-icon" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"><circle cx="7.5" cy="15.5" r="4.5"/><path d="M21 2l-9.6 9.6"/><path d="M15.5 7.5l3 3"/></svg>,
    // Shield icon — property management
    <svg key="shield" className="service-icon" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
    // Chart icon — investment advisory
    <svg key="chart" className="service-icon" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
    // Building icon — extra services
    <svg key="building" className="service-icon" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="1"/><path d="M9 22V12h6v10"/><path d="M9 7h1"/><path d="M14 7h1"/><path d="M9 11h1"/><path d="M14 11h1"/></svg>,
  ]

  // Gallery images from featured properties, padded with stock images
  const galleryImages = [
    ...featured.map(p => p.images[0]).filter(Boolean),
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80',
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80',
    'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&q=80',
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80',
    'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&q=80',
    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80',
  ].slice(0, 8)

  return (
    <main className="w-full bg-white overflow-x-hidden">

      {/* ── HERO — full-bleed image with Ken Burns + gradient overlay ── */}
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
        {/* Background image with Ken Burns */}
        <div className="absolute inset-0 overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1920&q=80"
            alt="Luxury property"
            className="hero-kenburns w-full h-full object-cover"
          />
          {/* Dark gradient overlay — text legibility */}
          <div className="absolute inset-0" style={{background:'linear-gradient(to bottom, rgba(31,31,31,0.55) 0%, rgba(31,31,31,0.25) 60%, rgba(31,31,31,0.50) 100%)'}} />
        </div>

        {/* Hero content */}
        <div className="relative z-10 max-w-[820px] w-full text-center flex flex-col items-center px-4 md:px-8">
          <h1 className="font-serif text-[44px] md:text-[64px] text-white leading-[1.05] tracking-[-0.02em] mb-6 drop-shadow-sm">{heroContent.title}</h1>
          <p className="font-sans text-[16px] md:text-[18px] text-white/80 leading-[1.7] mb-10 max-w-[560px]">{heroContent.subtitle}</p>
          <Link href={heroContent.linkUrl} className="inline-block bg-gold hover:bg-gold-dark text-charcoal font-sans text-[14px] font-medium px-10 py-4 rounded-full transition-colors duration-200 no-underline shadow-sm">
            {heroContent.linkText}
          </Link>
        </div>

        {/* Scroll-down indicator */}
        <div className="scroll-indicator-wrap absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1">
          <span className="font-sans text-[11px] uppercase tracking-widest text-white/60">{locale === 'ar' ? 'مرر' : 'Scroll'}</span>
          <div className="scroll-indicator">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{opacity:0.7}}>
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </div>
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <HomeStatsBar propertyCount={featured.length} locale={locale} />

      {/* ── FEATURED PROPERTIES ── */}
      <section className="py-16 md:py-24 px-4 md:px-8 max-w-[1200px] mx-auto">
        <div className="mb-10">
          <h2 className="font-serif text-[32px] md:text-[40px] text-charcoal leading-[1.15] mb-2">{locale === 'ar' ? 'عقارات مميزة' : 'Featured properties'}</h2>
          <p className="font-sans text-[14px] text-taupe">{locale === 'ar' ? 'منازل استثنائية مختارة لأصحاب الذوق الرفيع' : 'Exceptional homes curated for discerning buyers'}</p>
        </div>
        {featured.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {featured.map(p => (
              <Link key={p.id} href={`/properties/${p.id}`} className="block group no-underline">
                <div className="bg-white rounded-sm overflow-hidden transition-shadow duration-300 group-hover:shadow-hover border border-light-gray" style={{borderWidth:'0.5px'}}>
                  <div className="relative overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={p.images[0] ?? 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80'}
                      alt={p.title}
                      className="w-full h-[280px] object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <span className={`absolute top-3 left-3 font-sans text-[11px] font-medium px-2.5 py-1 rounded-sm ${statusBadge[p.status] ?? 'bg-white/90 text-charcoal'}`}>
                      {localiseLabel(p.status, STATUS_AR, locale)}
                    </span>
                    {/* "View property" overlay */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{background:'rgba(31,31,31,0.18)'}}>
                      <span className="font-sans text-[13px] font-medium text-white bg-charcoal/70 px-5 py-2.5 rounded-full backdrop-blur-sm">
                        {locale === 'ar' ? 'عرض العقار ←' : 'View property →'}
                      </span>
                    </div>
                  </div>
                  <div className="p-5 relative">
                    <h3 className="font-serif text-[18px] text-charcoal mb-2">{localise(p.title, p.titleAr, locale)}</h3>
                    <p className="font-sans text-[16px] font-medium text-gold mb-3">{p.price}</p>
                    <p className="font-sans text-[13px] text-taupe">{p.bedrooms} {locale === 'ar' ? 'غرف' : 'bed'} · {p.bathrooms} {locale === 'ar' ? 'حمام' : 'bath'} · {p.area}</p>
                    <p className="font-sans text-[12px] text-mid-gray italic mt-1">{localiseLabel(p.neighbourhood, NEIGHBOURHOOD_AR, locale)}</p>
                    {/* Gold bottom border slide-in */}
                    <div className="property-card-gold-bar absolute bottom-0 left-0 right-0 h-[2px] bg-gold" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="font-sans text-[14px] text-taupe mb-12">{locale === 'ar' ? 'لا توجد عقارات متاحة بعد.' : 'No properties available yet.'}</p>
        )}
        <div className="text-center">
          <Link href="/properties" className="inline-block border border-charcoal text-charcoal font-sans text-[14px] font-medium px-8 py-3 rounded-full hover:bg-charcoal hover:text-white transition-colors duration-200 no-underline" style={{borderWidth:'0.5px'}}>
            {locale === 'ar' ? 'تصفح جميع العقارات' : 'View all properties'}
          </Link>
        </div>
      </section>

      {/* ── SERVICES — icon cards with hover lift ── */}
      <section className="bg-cream py-16 md:py-24 px-4 md:px-8">
        <div className="max-w-[1200px] mx-auto">
          <div className="mb-12 text-center">
            <h2 className="font-serif text-[32px] md:text-[40px] text-charcoal leading-[1.15] mb-3">{servicesContent.title}</h2>
            <p className="font-sans text-[14px] text-taupe max-w-[500px] mx-auto">{servicesContent.subtitle}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {serviceCards.map((service, idx) => (
              <div key={service.key} className="service-card bg-white p-8 rounded-sm border border-light-gray" style={{borderWidth:'0.5px'}}>
                <div className="mb-5">
                  {serviceIcons[idx % serviceIcons.length]}
                </div>
                <h3 className="font-serif text-[20px] text-charcoal mb-4">{service.title}</h3>
                <p className="font-sans text-[14px] text-taupe leading-[1.7] mb-5">{service.paragraphs[0] ?? HOME_SERVICES_DEFAULTS.subtitle}</p>
                <Link href="/services" className="font-sans text-[13px] font-medium text-charcoal hover:text-gold transition-colors no-underline underline underline-offset-2">
                  {locale === 'ar' ? 'اعرف أكثر' : 'Learn more'}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ABOUT BRIEF — parallax image ── */}
      <section className="py-16 md:py-24 px-4 md:px-8 max-w-[1200px] mx-auto">
        <div className="flex flex-col md:flex-row gap-12 items-center">
          <div className="w-full md:w-1/2">
            <h2 className="font-serif text-[32px] md:text-[40px] text-charcoal leading-[1.15] mb-6">{aboutContent.title}</h2>
            <div className="space-y-4 mb-8">
              {aboutContent.paragraphs.map((paragraph, index) => (
                <p key={`home-about-${index}`} className="font-sans text-[15px] text-taupe leading-[1.7]">{paragraph}</p>
              ))}
            </div>
            <Link href={aboutContent.linkUrl} className="inline-block border border-charcoal text-charcoal font-sans text-[14px] font-medium px-8 py-3 rounded-full hover:bg-charcoal hover:text-white transition-colors no-underline" style={{borderWidth:'0.5px'}}>
              {aboutContent.linkText}
            </Link>
          </div>
          <HomeParallaxImage src={aboutContent.image} alt="Aurum Realty office" />
        </div>
      </section>

      {/* ── IMAGE GALLERY STRIP — horizontal auto-scroll ── */}
      {galleryImages.length > 0 && (
        <section className="py-12 overflow-hidden" aria-hidden="true">
          <div className="flex">
            {/* Duplicate the strip for seamless looping */}
            <div className="image-strip-track flex gap-4 flex-shrink-0">
              {[...galleryImages, ...galleryImages].map((src, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={i}
                  src={src}
                  alt=""
                  className="h-[200px] w-[300px] object-cover rounded-sm flex-shrink-0"
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── LATEST FROM THE JOURNAL — hide in Arabic if no Arabic translation ── */}
      {latestPost && (locale !== 'ar' || (latestPost.titleAr && latestPost.titleAr.trim())) && (
        <section className="bg-white py-14 px-4 md:px-8 border-t border-light-gray" style={{borderWidth:'0.5px 0 0 0'}}>
          <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <p className="font-sans text-[12px] font-medium text-taupe uppercase tracking-wider mb-2">{journalContent.label}</p>
              <h3 className="font-serif text-[22px] text-charcoal leading-[1.3] max-w-[520px]">{localise(latestPost.title, latestPost.titleAr, locale)}</h3>
            </div>
            <Link href={`/blog/${latestPost.slug}`} className="flex-shrink-0 inline-block bg-gold hover:bg-gold-dark text-charcoal font-sans text-[13px] font-medium px-6 py-3 rounded-full transition-colors no-underline">
              {journalContent.buttonText}
            </Link>
          </div>
        </section>
      )}

      {/* ── BOTTOM CTA ── */}
      <section className="bg-cream py-16 md:py-24 px-4 md:px-8">
        <div className="text-center max-w-[800px] mx-auto">
          <h2 className="font-serif text-[32px] md:text-[44px] text-charcoal leading-[1.15] mb-6">{ctaContent.title}</h2>
          <p className="font-sans text-[15px] text-taupe leading-[1.7] mb-8">{ctaContent.subtitle}</p>
          <Link href={ctaContent.linkUrl} className="inline-block bg-gold hover:bg-gold-dark text-charcoal font-sans text-[14px] font-medium px-8 py-3.5 rounded-full transition-colors no-underline">
            {ctaContent.linkText}
          </Link>
        </div>
      </section>

    </main>
  )
}
