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
import {
  HOME_SERVICES_DEFAULTS,
  SERVICE_SECTION_DEFAULTS,
  parseHomeAboutContent,
  parseHomeCtaContent,
  parseHomeFeaturedPropertiesContent,
  parseHomeHeroContent,
  parseHomeJournalContent,
  parseHomeServicesContent,
  parseServiceSectionContent,
  toContentMap,
} from '@/lib/site-content'

export const revalidate = 60

type HomeFeaturedProperty = Pick<
  Property,
  'id' | 'title' | 'price' | 'bedrooms' | 'bathrooms' | 'area' | 'images' | 'status' | 'neighbourhood'
>

type HomeLatestPost = Pick<
  BlogPost,
  'slug' | 'title' | 'topic' | 'heroImage' | 'readTime' | 'author'
>

export default async function HomePage() {
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
              'service_1',
              'service_2',
              'service_3',
            ],
          },
        },
      }),
      prisma.property.findMany({ where:{isPublished:true}, orderBy:{createdAt:'desc'}, take:3 }),
      prisma.blogPost.findFirst({ where:{isPublished:true}, orderBy:{publishedAt:'desc'}, select:{slug:true,title:true,topic:true,heroImage:true,readTime:true,author:true} }),
    ])

    homeSections = toContentMap(contentItems)
    latestPost = latestPublishedPost

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

    serviceCards = SERVICE_SECTION_DEFAULTS.map((defaults) =>
      parseServiceSectionContent(homeSections.get(defaults.key), defaults)
    )
  } catch {}

  const heroContent = parseHomeHeroContent(homeSections.get('home_hero'))
  const servicesContent = parseHomeServicesContent(homeSections.get('home_services'))
  const aboutContent = parseHomeAboutContent(homeSections.get('home_about'))
  const journalContent = parseHomeJournalContent(homeSections.get('home_journal'))
  const ctaContent = parseHomeCtaContent(homeSections.get('home_cta'))

  const statusBadge:Record<string,string> = {
    'For Sale':'bg-charcoal text-white','For Rent':'bg-gold text-charcoal','New Development':'bg-white/90 text-charcoal'
  }

  return (
    <main className="w-full bg-white">

      {/* HERO */}
      <section className="bg-cream min-h-[70vh] flex items-center justify-center py-16 px-4 md:px-8">
        <div className="max-w-[800px] w-full text-center flex flex-col items-center">
          <h1 className="font-serif text-[40px] md:text-[56px] text-charcoal leading-[1.1] tracking-[-0.02em] mb-6">{heroContent.title}</h1>
          <p className="font-sans text-[16px] md:text-[18px] text-taupe leading-[1.7] mb-8 max-w-[600px]">{heroContent.subtitle}</p>
          <Link href={heroContent.linkUrl} className="inline-block bg-gold hover:bg-gold-dark text-charcoal font-sans text-[14px] font-medium px-8 py-3.5 rounded-full transition-colors duration-200 no-underline">{heroContent.linkText}</Link>
        </div>
      </section>

      {/* FEATURED PROPERTIES */}
      <section className="py-16 md:py-24 px-4 md:px-8 max-w-[1200px] mx-auto">
        <div className="mb-10">
          <h2 className="font-serif text-[32px] md:text-[40px] text-charcoal leading-[1.15] mb-2">Featured properties</h2>
          <p className="font-sans text-[14px] text-taupe">Exceptional homes curated for discerning buyers</p>
        </div>
        {featured.length>0?(
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {featured.map(p=>(
              <Link key={p.id} href={`/properties/${p.id}`} className="block group no-underline">
                <div className="bg-white rounded-sm overflow-hidden transition-shadow duration-200 group-hover:shadow-hover border border-light-gray" style={{borderWidth:'0.5px'}}>
                  <div className="relative overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.images[0]??'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80'} alt={p.title} className="w-full h-[240px] object-cover transition-transform duration-500 group-hover:scale-105"/>
                    <span className={`absolute top-3 left-3 font-sans text-[11px] font-medium px-2.5 py-1 rounded-sm ${statusBadge[p.status]??'bg-white/90 text-charcoal'}`}>{p.status}</span>
                  </div>
                  <div className="p-5">
                    <h3 className="font-serif text-[18px] text-charcoal mb-2">{p.title}</h3>
                    <p className="font-sans text-[16px] font-medium text-gold mb-3">{p.price}</p>
                    <p className="font-sans text-[13px] text-taupe">{p.bedrooms} bed · {p.bathrooms} bath · {p.area}</p>
                    <p className="font-sans text-[12px] text-mid-gray italic mt-1">{p.neighbourhood}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ):(
          <p className="font-sans text-[14px] text-taupe mb-12">No properties available yet.</p>
        )}
        <div className="text-center">
          <Link href="/properties" className="inline-block border border-charcoal text-charcoal font-sans text-[14px] font-medium px-8 py-3 rounded-full hover:bg-charcoal hover:text-white transition-colors duration-200 no-underline" style={{borderWidth:'0.5px'}}>
            View all properties
          </Link>
        </div>
      </section>

      {/* SERVICES OVERVIEW */}
      <section className="bg-cream py-16 md:py-24 px-4 md:px-8">
        <div className="max-w-[1200px] mx-auto">
          <div className="mb-12 text-center">
            <h2 className="font-serif text-[32px] md:text-[40px] text-charcoal leading-[1.15] mb-3">{servicesContent.title}</h2>
            <p className="font-sans text-[14px] text-taupe max-w-[500px] mx-auto">{servicesContent.subtitle}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {serviceCards.map((service)=>(
              <div key={service.key} className="bg-cream p-8 rounded-sm" style={{borderWidth:'0.5px'}}>
                <h3 className="font-serif text-[20px] text-charcoal mb-4">{service.title}</h3>
                <p className="font-sans text-[14px] text-taupe leading-[1.7] mb-5">{service.paragraphs[0] ?? HOME_SERVICES_DEFAULTS.subtitle}</p>
                <Link href="/services" className="font-sans text-[13px] font-medium text-charcoal hover:text-taupe transition-colors no-underline underline">Learn more</Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ABOUT BRIEF */}
      <section className="py-16 md:py-24 px-4 md:px-8 max-w-[1200px] mx-auto">
        <div className="flex flex-col md:flex-row gap-12 items-center">
          <div className="w-full md:w-1/2">
            <h2 className="font-serif text-[32px] md:text-[40px] text-charcoal leading-[1.15] mb-6">{aboutContent.title}</h2>
            <div className="space-y-4 mb-8">
              {aboutContent.paragraphs.map((paragraph, index) => (
                <p key={`home-about-${index}`} className="font-sans text-[15px] text-taupe leading-[1.7]">{paragraph}</p>
              ))}
            </div>
            <Link href={aboutContent.linkUrl} className="inline-block border border-charcoal text-charcoal font-sans text-[14px] font-medium px-8 py-3 rounded-full hover:bg-charcoal hover:text-white transition-colors no-underline" style={{borderWidth:'0.5px'}}>{aboutContent.linkText}</Link>
          </div>
          <div className="w-full md:w-1/2 overflow-hidden rounded-sm">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={aboutContent.image} alt="Aurum Realty office" className="w-full h-[360px] object-cover"/>
          </div>
        </div>
      </section>

      {/* LATEST FROM THE JOURNAL */}
      {latestPost&&(
        <section className="bg-white py-14 px-4 md:px-8">
          <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <p className="font-sans text-[12px] font-medium text-taupe uppercase tracking-wider mb-2">{journalContent.label}</p>
              <h3 className="font-serif text-[22px] text-charcoal leading-[1.3] max-w-[520px]">{latestPost.title}</h3>
            </div>
            <Link href={`/blog/${latestPost.slug}`} className="flex-shrink-0 inline-block bg-gold hover:bg-gold-dark text-charcoal font-sans text-[13px] font-medium px-6 py-3 rounded-full transition-colors no-underline">{journalContent.buttonText}</Link>
          </div>
        </section>
      )}

      {/* BOTTOM CTA */}
      <section className="bg-cream py-16 md:py-24 px-4 md:px-8">
        <div className="text-center max-w-[800px] mx-auto">
          <h2 className="font-serif text-[32px] md:text-[44px] text-charcoal leading-[1.15] mb-6">{ctaContent.title}</h2>
          <p className="font-sans text-[15px] text-taupe leading-[1.7] mb-8">{ctaContent.subtitle}</p>
          <Link href={ctaContent.linkUrl} className="inline-block bg-gold hover:bg-gold-dark text-charcoal font-sans text-[14px] font-medium px-8 py-3.5 rounded-full transition-colors no-underline">{ctaContent.linkText}</Link>
        </div>
      </section>
    </main>
  )
}
