/**
 * Footer component — async server component.
 *
 * Reads phone, email, address, hours, and social links from the
 * SiteContent table (keys: site_settings_general, site_settings_hours,
 * site_settings_social) so dashboard edits are reflected here.
 * Falls back to hardcoded defaults if the DB is unreachable or the
 * keys haven't been saved yet.
 *
 * revalidate = 60 — stale-while-revalidate, so it stays fast.
 */

import React from 'react'
import Link from 'next/link'
import { AurumLogo } from '@/components/AurumLogo'
import { prisma } from '@/lib/prisma'
import type { Locale } from '@/lib/i18n'

export const revalidate = 60

// ─── Defaults (shown when DB has no saved values) ────────────────────────────

const DEFAULTS = {
  tagline:    'Founded 2010. \nLuxury properties for discerning buyers.\nFor over a decade we have guided discerning buyers and sellers through the most significant real estate decisions of their lives — with discretion, expertise, and an unwavering commitment to excellence.\nEvery property we represent is selected for its exceptional quality. Every client we serve receives our full attention.',
  phone:      '+1 (555) 123-4567',
  email:      'hello@aurumrealty.com',
  address:    '123 Luxury Avenue\nSuite 400\nNew York, NY 10022',
  monFri:     '9am – 6pm',
  saturday:   '10am – 4pm',
  sunday:     'By appointment',
  instagram:  '#',
  linkedin:   '#',
  facebook:   '#',
  companyName: 'Aurum Realty',
}

// ─── Safe JSON parse helper ───────────────────────────────────────────────────

function parseBody(body: string | null | undefined): Record<string, string> {
  if (!body) return {}
  try {
    const parsed = JSON.parse(body)
    return typeof parsed === 'object' && parsed !== null ? parsed : {}
  } catch {
    return {}
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

export async function Footer({ locale }: { locale: Locale }) {
  // Fetch all three keys in one query
  let general: Record<string, string> = {}
  let hours: Record<string, string> = {}
  let social: Record<string, string> = {}

  try {
    const rows = await prisma.siteContent.findMany({
      where: {
        key: {
          in: ['site_settings_general', 'site_settings_hours', 'site_settings_social'],
        },
      },
      select: { key: true, body: true },
    })

    for (const row of rows) {
      const data = parseBody(row.body)
      if (row.key === 'site_settings_general') general = data
      if (row.key === 'site_settings_hours')   hours   = data
      if (row.key === 'site_settings_social')  social  = data
    }
  } catch {
    // DB unreachable — fall through to defaults
  }

  // Resolve values with fallback to defaults
  const phone      = general.phone       || DEFAULTS.phone
  const email      = general.email       || DEFAULTS.email
  const address    = general.address     || DEFAULTS.address
  const tagline    = DEFAULTS.tagline
  const monFri     = hours.monFri        || DEFAULTS.monFri
  const saturday   = hours.saturday      || DEFAULTS.saturday
  const sunday     = hours.sunday        || DEFAULTS.sunday
  const instagram  = social.instagram    || DEFAULTS.instagram
  const linkedin   = social.linkedin     || DEFAULTS.linkedin
  const facebook   = social.facebook     || DEFAULTS.facebook

  // Split address on newlines so <br /> works correctly
  const addressLines = address.split('\n').filter(Boolean)

  const socialLinks = [
    { label: 'Instagram', href: instagram },
    { label: 'LinkedIn',  href: linkedin  },
    { label: 'Facebook',  href: facebook  },
  ]

  return (
    <footer
      className="bg-charcoal text-mid-gray border-t border-light-gray"
      style={{ borderWidth: '0.5px 0 0 0' }}
    >
      <div className="max-w-[1200px] mx-auto px-4 md:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">

          {/* Col 1 — Logo + tagline */}
          <div>
            <div className="mb-4">
              <AurumLogo variant="dark" height={30} />
            </div>
            <p className="font-sans text-[13px] text-taupe leading-[1.8]">
              {tagline}
            </p>
          </div>

          {/* Col 2 — Quick links (static — these are routes, not content) */}
          <div>
            <p className="font-sans text-[14px] font-medium text-white mb-6">
              {locale === 'ar' ? 'روابط سريعة' : 'Quick Links'}
            </p>
            <nav className="flex flex-col gap-3">
              {[
                { labelEn: 'Home',       labelAr: 'الرئيسية', href: '/'           },
                { labelEn: 'Properties', labelAr: 'العقارات', href: '/properties' },
                { labelEn: 'Services',   labelAr: 'الخدمات', href: '/services'   },
                { labelEn: 'About',      labelAr: 'عن الشركة', href: '/about'      },
                { labelEn: 'Blog',       labelAr: 'المدونة', href: '/blog'       },
                { labelEn: 'News',       labelAr: 'الأخبار', href: '/news'       },
                { labelEn: 'Contact',    labelAr: 'تواصل', href: '/contact'    },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="font-sans text-[13px] text-mid-gray no-underline hover:text-gold transition-colors duration-200"
                >
                  {locale === 'ar' ? link.labelAr : link.labelEn}
                </Link>
              ))}
            </nav>
          </div>

          {/* Col 3 — Contact details */}
          <div>
            <p className="font-sans text-[14px] font-medium text-white mb-6">
              {locale === 'ar' ? 'تواصل' : 'Contact'}
            </p>
            <div className="flex flex-col gap-3 font-sans text-[13px] text-mid-gray">
              <p>{phone}</p>
              <a
                href={`mailto:${email}`}
                className="text-mid-gray no-underline hover:text-gold transition-colors duration-200"
              >
                {email}
              </a>
              <p className="leading-[1.7] mt-2">
                {addressLines.map((line, i) => (
                  <React.Fragment key={i}>
                    {line}
                    {i < addressLines.length - 1 && <br />}
                  </React.Fragment>
                ))}
              </p>
            </div>
          </div>

          {/* Col 4 — Hours + social */}
          <div>
            <p className="font-sans text-[14px] font-medium text-white mb-6">
              {locale === 'ar' ? 'الساعات' : 'Hours'}
            </p>
            <div className="flex flex-col gap-3 font-sans text-[13px] text-mid-gray mb-8">
              <p>{locale === 'ar' ? 'الاثنين – الجمعة' : 'Monday – Friday'}: {monFri}</p>
              <p>{locale === 'ar' ? 'السبت' : 'Saturday'}: {saturday}</p>
              <p>{locale === 'ar' ? 'الأحد' : 'Sunday'}: {sunday}</p>
            </div>

            <p className="font-sans text-[14px] font-medium text-white mb-4">
              {locale === 'ar' ? 'وسائل التواصل' : 'Connect'}
            </p>
            <div className="flex flex-col gap-3">
              {socialLinks.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target={s.href !== '#' ? '_blank' : undefined}
                  rel={s.href !== '#' ? 'noopener noreferrer' : undefined}
                  className="font-sans text-[13px] text-mid-gray no-underline hover:text-gold transition-colors duration-200"
                >
                  {s.label}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-taupe/30">
          <p className="font-sans text-[13px] text-taupe">
            {locale === 'ar'
              ? `© ${new Date().getFullYear()} أوروم ريالتي. جميع الحقوق محفوظة.`
              : `© ${new Date().getFullYear()} Aurum Realty. All rights reserved.`}
          </p>
        </div>
      </div>
    </footer>
  )
}