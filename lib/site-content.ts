import type { SiteContent } from '@prisma/client'

type SiteContentRecord = SiteContent | null | undefined

export type SiteContentEntryInput = {
  key: string
  title?: string | null
  subtitle?: string | null
  body?: string | null
  image?: string | null
  linkText?: string | null
  linkUrl?: string | null
}

export type HomeHeroContent = {
  title: string
  subtitle: string
  linkText: string
  linkUrl: string
}

export type HomeServicesContent = {
  title: string
  subtitle: string
}

export type HomeAboutContent = {
  title: string
  paragraphs: string[]
  image: string
  linkText: string
  linkUrl: string
}

export type HomeJournalContent = {
  label: string
  buttonText: string
}

export type HomeCtaContent = {
  title: string
  subtitle: string
  linkText: string
  linkUrl: string
}

export type HomeFeaturedPropertiesContent = {
  propertyIds: number[]
}

export type AboutStoryContent = {
  title: string
  subtitle: string
  paragraphs: string[]
  image: string
}

export type AboutTeamMember = {
  name: string
  role: string
  bio: string
  image: string
}

export type AboutTeamContent = {
  title: string
  members: AboutTeamMember[]
}

export type AboutValueItem = {
  label: string
  desc: string
}

export type AboutValuesContent = {
  title: string
  items: AboutValueItem[]
}

export type CtaContent = {
  title: string
  subtitle: string
  linkText: string
  linkUrl: string
}

export type ContactPageContent = {
  title: string
  subtitle: string
}

export type SiteSettingsGeneralContent = {
  companyName: string
  tagline: string
  contactEmail: string
  phone: string
  addressLines: string[]
}

export type SiteSettingsSocialLink = {
  label: string
  url: string
}

export type SiteSettingsSocialContent = {
  links: SiteSettingsSocialLink[]
}

export type SiteSettingsHoursRow = {
  label: string
  value: string
}

export type SiteSettingsHoursContent = {
  rows: SiteSettingsHoursRow[]
}

export type SeoDefaultsContent = {
  titleTemplate: string
  description: string
}

export type ServiceSectionContent = {
  key: 'service_1' | 'service_2' | 'service_3'
  title: string
  paragraphs: string[]
  points: string[]
  image: string
  reverse?: boolean
}

export type ServicesHeaderContent = {
  title: string
  subtitle: string
}

export const HOME_HERO_DEFAULTS: HomeHeroContent = {
  title: 'Find your dream property',
  subtitle: 'Discover luxury homes and investments in prime locations',
  linkText: 'Explore properties',
  linkUrl: '/properties',
}

export const HOME_SERVICES_DEFAULTS: HomeServicesContent = {
  title: 'How we can help',
  subtitle: 'Comprehensive luxury real estate services tailored to your needs',
}

export const HOME_ABOUT_DEFAULTS: HomeAboutContent = {
  title: 'A trusted name in luxury real estate',
  paragraphs: [
    'Founded in 2010, Aurum Realty has built a reputation for discretion, deep market knowledge, and unparalleled client service across the world\'s most sought-after residential markets.',
  ],
  image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&q=80',
  linkText: 'Our story',
  linkUrl: '/about',
}

export const HOME_JOURNAL_DEFAULTS: HomeJournalContent = {
  label: 'Latest from the Journal',
  buttonText: 'Read article',
}

export const HOME_CTA_DEFAULTS: HomeCtaContent = {
  title: 'Ready to find your next property?',
  subtitle: 'Our advisors are available to help you navigate the luxury market with confidence.',
  linkText: 'Get in touch',
  linkUrl: '/contact',
}

export const HOME_FEATURED_PROPERTIES_DEFAULTS: HomeFeaturedPropertiesContent = {
  propertyIds: [],
}

export const ABOUT_STORY_DEFAULTS: AboutStoryContent = {
  title: 'About our agency',
  subtitle: 'Trusted expertise in luxury real estate since 2010',
  paragraphs: [
    'Aurum Realty was founded in 2010 with a singular vision: to elevate the standard of service in the luxury real estate market. We recognised that discerning clients required more than just property listings; they needed strategic advisors who understood the nuances of premium assets.',
    'What began as a boutique agency has grown into a globally recognised firm, facilitating some of the most significant residential transactions in the region. Despite our growth, we have deliberately maintained our boutique ethos — prioritising quality over quantity and relationships over transactions.',
    'Our success is built on discretion, deep market intelligence, and an unwavering commitment to our clients\' best interests. We do not just sell properties; we curate lifestyles and build generational wealth through strategic real estate investments.',
    'Today, our portfolio represents the pinnacle of architectural achievement and luxury living, while our team remains dedicated to providing an unparalleled advisory experience.',
  ],
  image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&q=80',
}

export const ABOUT_TEAM_DEFAULTS: AboutTeamContent = {
  title: 'Our team',
  members: [
    {
      name: 'Sarah Johnson',
      role: 'Managing Director',
      bio: 'With over 20 years in luxury real estate, Sarah has facilitated some of the most significant residential transactions in the region. Her expertise spans acquisitions, disposals, and investment strategy.',
      image: '',
    },
    {
      name: 'Michael Chen',
      role: 'Senior Agent',
      bio: 'Michael specialises in the premium residential market, with particular focus on new development and off-plan acquisitions. He works closely with a select group of domestic and international clients.',
      image: '',
    },
    {
      name: 'Emily Brooks',
      role: 'Investment Specialist',
      bio: 'Emily brings institutional investment expertise to our private client advisory practice, advising high-net-worth individuals on portfolio construction and strategic real estate allocation.',
      image: '',
    },
  ],
}

export const ABOUT_VALUES_DEFAULTS: AboutValuesContent = {
  title: 'What we stand for',
  items: [
    {
      label: 'Integrity',
      desc: 'We act in our clients\' best interests, always. Our advice is honest, even when it is not what clients want to hear.',
    },
    {
      label: 'Excellence',
      desc: 'Every instruction, regardless of scale, receives the same level of attention and rigour that has defined our reputation.',
    },
    {
      label: 'Client focus',
      desc: 'We measure our success by our clients\' outcomes, not transaction volumes. Long-term relationships are the foundation of our practice.',
    },
  ],
}

export const ABOUT_CTA_DEFAULTS: CtaContent = {
  title: 'Ready to work with us?',
  subtitle: 'We would be delighted to discuss how we can help you achieve your real estate objectives.',
  linkText: 'Get in touch',
  linkUrl: '/contact',
}

export const CONTACT_PAGE_DEFAULTS: ContactPageContent = {
  title: 'Get in touch',
  subtitle: 'We are here to help you find the perfect property',
}

export const SITE_SETTINGS_GENERAL_DEFAULTS: SiteSettingsGeneralContent = {
  companyName: 'Aurum Realty',
  tagline: 'Luxury properties for discerning buyers.',
  contactEmail: 'hello@aurumrealty.com',
  phone: '+1 (555) 123-4567',
  addressLines: ['123 Luxury Avenue', 'Suite 400', 'New York, NY 10022'],
}

export const SITE_SETTINGS_SOCIAL_DEFAULTS: SiteSettingsSocialContent = {
  links: [
    { label: 'Instagram', url: 'https://instagram.com/aurumrealty' },
    { label: 'LinkedIn', url: 'https://linkedin.com/company/aurumrealty' },
    { label: 'Facebook', url: 'https://facebook.com/aurumrealty' },
  ],
}

export const SITE_SETTINGS_HOURS_DEFAULTS: SiteSettingsHoursContent = {
  rows: [
    { label: 'Monday', value: '9am – 6pm' },
    { label: 'Tuesday', value: '9am – 6pm' },
    { label: 'Wednesday', value: '9am – 6pm' },
    { label: 'Thursday', value: '9am – 6pm' },
    { label: 'Friday', value: '9am – 6pm' },
    { label: 'Saturday', value: '10am – 4pm' },
    { label: 'Sunday', value: 'By appointment' },
  ],
}

export const SEO_DEFAULTS: SeoDefaultsContent = {
  titleTemplate: '%s | Aurum Realty',
  description: 'Aurum Realty is the premier destination for luxury real estate, offering exclusive properties and unparalleled advisory services.',
}

export const SERVICES_HEADER_DEFAULTS: ServicesHeaderContent = {
  title: 'Our services',
  subtitle: 'Comprehensive real estate solutions',
}

export const SERVICE_SECTION_DEFAULTS: ServiceSectionContent[] = [
  {
    key: 'service_1',
    title: 'Property sales',
    paragraphs: [
      'Selling a luxury property requires a strategic approach, deep market knowledge, and an extensive network. Our comprehensive sales service is designed to maximise your property\'s value while ensuring a seamless transaction process.',
      'We begin with a detailed market analysis and property valuation, followed by a customised marketing strategy that positions your home to attract the right buyers.',
    ],
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80',
    points: [
      'Professional architectural photography and videography',
      'Targeted digital and print marketing campaigns',
      'Access to our exclusive global network of buyers',
      'Expert negotiation and transaction management',
    ],
  },
  {
    key: 'service_2',
    title: 'Property management',
    paragraphs: [
      'Our comprehensive property management service takes the complexity out of owning investment real estate. From finding and vetting premium tenants to overseeing maintenance and compliance, we manage every aspect of your property investment.',
      'We understand that your property represents a significant investment, and we treat it accordingly — with the same diligence and attention to detail that we apply to every instruction.',
    ],
    image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1200&q=80',
    points: [
      'Rigorous tenant screening and selection',
      'Rent collection and arrears management',
      'Preventive maintenance programmes',
      'Full financial reporting and transparency',
    ],
    reverse: true,
  },
  {
    key: 'service_3',
    title: 'Investment advisory',
    paragraphs: [
      'For clients seeking to build or optimise a real estate portfolio, our investment advisory service provides the strategic insight and market access needed to make informed decisions.',
      'Our advisors work alongside family offices, high-net-worth individuals, and institutional clients to identify opportunities that align with their investment objectives and risk parameters.',
    ],
    image: 'https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=1200&q=80',
    points: [
      'Portfolio strategy and asset allocation',
      'Market analysis and opportunity identification',
      'Due diligence and acquisition support',
      'Ongoing portfolio monitoring and reporting',
    ],
  },
]

export const SERVICES_CTA_DEFAULTS: CtaContent = {
  title: 'Ready to get started?',
  subtitle: 'Whatever your real estate objective, our team has the experience and network to help you achieve it.',
  linkText: 'Contact us',
  linkUrl: '/contact',
}

export function toContentMap(items: SiteContent[] = []) {
  return new Map(items.map(item => [item.key, item]))
}

function safeParseJson<T>(value: string | null | undefined): T | null {
  if (!value) return null

  try {
    return JSON.parse(value) as T
  } catch {
    return null
  }
}

function cleanParagraphs(paragraphs: Array<string | null | undefined>) {
  return paragraphs.map(item => (item ?? '').trim()).filter(Boolean)
}

export function getParagraphsFromBody(body: string | null | undefined, fallback: string[]) {
  const parsed = safeParseJson<{ paragraphs?: string[] }>(body)
  if (parsed?.paragraphs) {
    return cleanParagraphs(parsed.paragraphs)
  }

  if (body?.trim()) {
    return cleanParagraphs(body.split('\n\n'))
  }

  return fallback
}

export function serializeParagraphs(paragraphs: string[]) {
  return JSON.stringify({
    paragraphs: cleanParagraphs(paragraphs),
  })
}

export function parseHomeHeroContent(content: SiteContentRecord): HomeHeroContent {
  return {
    title: content?.title ?? HOME_HERO_DEFAULTS.title,
    subtitle: content?.subtitle ?? HOME_HERO_DEFAULTS.subtitle,
    linkText: content?.linkText ?? HOME_HERO_DEFAULTS.linkText,
    linkUrl: content?.linkUrl ?? HOME_HERO_DEFAULTS.linkUrl,
  }
}

export function toHomeHeroEntry(content: HomeHeroContent): SiteContentEntryInput {
  return {
    key: 'home_hero',
    title: content.title,
    subtitle: content.subtitle,
    linkText: content.linkText,
    linkUrl: content.linkUrl,
  }
}

export function parseHomeServicesContent(content: SiteContentRecord): HomeServicesContent {
  return {
    title: content?.title ?? HOME_SERVICES_DEFAULTS.title,
    subtitle: content?.subtitle ?? HOME_SERVICES_DEFAULTS.subtitle,
  }
}

export function toHomeServicesEntry(content: HomeServicesContent): SiteContentEntryInput {
  return {
    key: 'home_services',
    title: content.title,
    subtitle: content.subtitle,
  }
}

export function parseHomeAboutContent(content: SiteContentRecord): HomeAboutContent {
  return {
    title: content?.title ?? HOME_ABOUT_DEFAULTS.title,
    paragraphs: getParagraphsFromBody(content?.body, HOME_ABOUT_DEFAULTS.paragraphs),
    image: content?.image ?? HOME_ABOUT_DEFAULTS.image,
    linkText: content?.linkText ?? HOME_ABOUT_DEFAULTS.linkText,
    linkUrl: content?.linkUrl ?? HOME_ABOUT_DEFAULTS.linkUrl,
  }
}

export function toHomeAboutEntry(content: HomeAboutContent): SiteContentEntryInput {
  return {
    key: 'home_about',
    title: content.title,
    body: serializeParagraphs(content.paragraphs),
    image: content.image,
    linkText: content.linkText,
    linkUrl: content.linkUrl,
  }
}

export function parseHomeJournalContent(content: SiteContentRecord): HomeJournalContent {
  return {
    label: content?.title ?? HOME_JOURNAL_DEFAULTS.label,
    buttonText: content?.linkText ?? HOME_JOURNAL_DEFAULTS.buttonText,
  }
}

export function toHomeJournalEntry(content: HomeJournalContent): SiteContentEntryInput {
  return {
    key: 'home_journal',
    title: content.label,
    linkText: content.buttonText,
  }
}

export function parseHomeCtaContent(content: SiteContentRecord): HomeCtaContent {
  return {
    title: content?.title ?? HOME_CTA_DEFAULTS.title,
    subtitle: content?.subtitle ?? HOME_CTA_DEFAULTS.subtitle,
    linkText: content?.linkText ?? HOME_CTA_DEFAULTS.linkText,
    linkUrl: content?.linkUrl ?? HOME_CTA_DEFAULTS.linkUrl,
  }
}

export function toHomeCtaEntry(content: HomeCtaContent): SiteContentEntryInput {
  return {
    key: 'home_cta',
    title: content.title,
    subtitle: content.subtitle,
    linkText: content.linkText,
    linkUrl: content.linkUrl,
  }
}

export function parseHomeFeaturedPropertiesContent(content: SiteContentRecord): HomeFeaturedPropertiesContent {
  const parsed = safeParseJson<{ propertyIds?: number[] }>(content?.body)
  return {
    propertyIds: Array.isArray(parsed?.propertyIds)
      ? parsed.propertyIds.filter(id => typeof id === 'number')
      : HOME_FEATURED_PROPERTIES_DEFAULTS.propertyIds,
  }
}

export function toHomeFeaturedPropertiesEntry(content: HomeFeaturedPropertiesContent): SiteContentEntryInput {
  return {
    key: 'home_featured_properties',
    body: JSON.stringify({
      propertyIds: content.propertyIds,
    }),
  }
}

export function parseAboutStoryContent(content: SiteContentRecord): AboutStoryContent {
  return {
    title: content?.title ?? ABOUT_STORY_DEFAULTS.title,
    subtitle: content?.subtitle ?? ABOUT_STORY_DEFAULTS.subtitle,
    paragraphs: getParagraphsFromBody(content?.body, ABOUT_STORY_DEFAULTS.paragraphs),
    image: content?.image ?? ABOUT_STORY_DEFAULTS.image,
  }
}

export function toAboutStoryEntry(content: AboutStoryContent): SiteContentEntryInput {
  return {
    key: 'about_story',
    title: content.title,
    subtitle: content.subtitle,
    body: serializeParagraphs(content.paragraphs),
    image: content.image,
  }
}

export function parseAboutTeamContent(content: SiteContentRecord): AboutTeamContent {
  const parsed = safeParseJson<AboutTeamContent>(content?.body)
  const members = Array.isArray(parsed?.members)
    ? parsed.members.map(member => ({
        name: member.name ?? '',
        role: member.role ?? '',
        bio: member.bio ?? '',
        image: member.image ?? '',
      }))
    : ABOUT_TEAM_DEFAULTS.members

  return {
    title: content?.title ?? parsed?.title ?? ABOUT_TEAM_DEFAULTS.title,
    members,
  }
}

export function toAboutTeamEntry(content: AboutTeamContent): SiteContentEntryInput {
  return {
    key: 'about_team',
    title: content.title,
    body: JSON.stringify({
      title: content.title,
      members: content.members,
    }),
  }
}

export function parseAboutValuesContent(content: SiteContentRecord): AboutValuesContent {
  const parsed = safeParseJson<AboutValuesContent>(content?.body)
  const items = Array.isArray(parsed?.items)
    ? parsed.items.map(item => ({
        label: item.label ?? '',
        desc: item.desc ?? '',
      }))
    : ABOUT_VALUES_DEFAULTS.items

  return {
    title: content?.title ?? parsed?.title ?? ABOUT_VALUES_DEFAULTS.title,
    items,
  }
}

export function toAboutValuesEntry(content: AboutValuesContent): SiteContentEntryInput {
  return {
    key: 'about_values',
    title: content.title,
    body: JSON.stringify({
      title: content.title,
      items: content.items,
    }),
  }
}

export function parseCtaContent(content: SiteContentRecord, defaults: CtaContent): CtaContent {
  return {
    title: content?.title ?? defaults.title,
    subtitle: content?.subtitle ?? defaults.subtitle,
    linkText: content?.linkText ?? defaults.linkText,
    linkUrl: content?.linkUrl ?? defaults.linkUrl,
  }
}

export function toCtaEntry(key: string, content: CtaContent): SiteContentEntryInput {
  return {
    key,
    title: content.title,
    subtitle: content.subtitle,
    linkText: content.linkText,
    linkUrl: content.linkUrl,
  }
}

export function parseContactPageContent(content: SiteContentRecord): ContactPageContent {
  return {
    title: content?.title ?? CONTACT_PAGE_DEFAULTS.title,
    subtitle: content?.subtitle ?? CONTACT_PAGE_DEFAULTS.subtitle,
  }
}

export function toContactPageEntry(content: ContactPageContent): SiteContentEntryInput {
  return {
    key: 'contact_page',
    title: content.title,
    subtitle: content.subtitle,
  }
}

export function parseSiteSettingsGeneralContent(content: SiteContentRecord): SiteSettingsGeneralContent {
  const parsed = safeParseJson<SiteSettingsGeneralContent>(content?.body)

  return {
    companyName: content?.title ?? parsed?.companyName ?? SITE_SETTINGS_GENERAL_DEFAULTS.companyName,
    tagline: content?.subtitle ?? parsed?.tagline ?? SITE_SETTINGS_GENERAL_DEFAULTS.tagline,
    contactEmail: parsed?.contactEmail ?? SITE_SETTINGS_GENERAL_DEFAULTS.contactEmail,
    phone: parsed?.phone ?? SITE_SETTINGS_GENERAL_DEFAULTS.phone,
    addressLines: Array.isArray(parsed?.addressLines)
      ? cleanParagraphs(parsed.addressLines)
      : SITE_SETTINGS_GENERAL_DEFAULTS.addressLines,
  }
}

export function toSiteSettingsGeneralEntry(content: SiteSettingsGeneralContent): SiteContentEntryInput {
  return {
    key: 'site_settings_general',
    title: content.companyName,
    subtitle: content.tagline,
    body: JSON.stringify({
      companyName: content.companyName,
      tagline: content.tagline,
      contactEmail: content.contactEmail,
      phone: content.phone,
      addressLines: cleanParagraphs(content.addressLines),
    }),
  }
}

export function parseSiteSettingsSocialContent(content: SiteContentRecord): SiteSettingsSocialContent {
  const parsed = safeParseJson<SiteSettingsSocialContent>(content?.body)

  return {
    links: Array.isArray(parsed?.links)
      ? parsed.links.map((link) => ({
          label: link.label ?? '',
          url: link.url ?? '',
        }))
      : SITE_SETTINGS_SOCIAL_DEFAULTS.links,
  }
}

export function toSiteSettingsSocialEntry(content: SiteSettingsSocialContent): SiteContentEntryInput {
  return {
    key: 'site_settings_social',
    body: JSON.stringify({
      links: content.links.map((link) => ({
        label: link.label.trim(),
        url: link.url.trim(),
      })),
    }),
  }
}

export function parseSiteSettingsHoursContent(content: SiteContentRecord): SiteSettingsHoursContent {
  const parsed = safeParseJson<SiteSettingsHoursContent>(content?.body)

  return {
    rows: Array.isArray(parsed?.rows)
      ? parsed.rows.map((row) => ({
          label: row.label ?? '',
          value: row.value ?? '',
        }))
      : SITE_SETTINGS_HOURS_DEFAULTS.rows,
  }
}

export function toSiteSettingsHoursEntry(content: SiteSettingsHoursContent): SiteContentEntryInput {
  return {
    key: 'site_settings_hours',
    body: JSON.stringify({
      rows: content.rows.map((row) => ({
        label: row.label.trim(),
        value: row.value.trim(),
      })),
    }),
  }
}

export function parseSeoDefaultsContent(content: SiteContentRecord): SeoDefaultsContent {
  return {
    titleTemplate: content?.title ?? SEO_DEFAULTS.titleTemplate,
    description: content?.body ?? SEO_DEFAULTS.description,
  }
}

export function toSeoDefaultsEntry(content: SeoDefaultsContent): SiteContentEntryInput {
  return {
    key: 'seo_defaults',
    title: content.titleTemplate,
    body: content.description,
  }
}

export function parseServicesHeaderContent(content: SiteContentRecord): ServicesHeaderContent {
  return {
    title: content?.title ?? SERVICES_HEADER_DEFAULTS.title,
    subtitle: content?.subtitle ?? SERVICES_HEADER_DEFAULTS.subtitle,
  }
}

export function toServicesHeaderEntry(content: ServicesHeaderContent): SiteContentEntryInput {
  return {
    key: 'services_header',
    title: content.title,
    subtitle: content.subtitle,
  }
}

export function parseServiceSectionContent(content: SiteContentRecord, defaults: ServiceSectionContent): ServiceSectionContent {
  const parsed = safeParseJson<{ paragraphs?: string[]; points?: string[] }>(content?.body)

  return {
    ...defaults,
    title: content?.title ?? defaults.title,
    image: content?.image ?? defaults.image,
    paragraphs: parsed?.paragraphs ? cleanParagraphs(parsed.paragraphs) : getParagraphsFromBody(content?.body, defaults.paragraphs),
    points: Array.isArray(parsed?.points) ? cleanParagraphs(parsed.points) : defaults.points,
  }
}

export function toServiceSectionEntry(content: ServiceSectionContent): SiteContentEntryInput {
  return {
    key: content.key,
    title: content.title,
    image: content.image,
    body: JSON.stringify({
      paragraphs: cleanParagraphs(content.paragraphs),
      points: cleanParagraphs(content.points),
    }),
  }
}
