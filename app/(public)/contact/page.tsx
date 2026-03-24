import React from 'react'
import { prisma } from '@/lib/prisma'
import ContactPageClient from './ContactPageClient'
import {
  CONTACT_PAGE_DEFAULTS,
  SITE_SETTINGS_GENERAL_DEFAULTS,
  SITE_SETTINGS_HOURS_DEFAULTS,
  SITE_SETTINGS_SOCIAL_DEFAULTS,
  parseContactPageContent,
  parseSiteSettingsGeneralContent,
  parseSiteSettingsHoursContent,
  parseSiteSettingsSocialContent,
  toContentMap,
} from '@/lib/site-content'

export const revalidate = 60

export default async function ContactPage() {
  let contentMap = toContentMap([])

  try {
    const items = await prisma.siteContent.findMany({
      where: {
        key: {
          in: [
            'contact_page',
            'site_settings_general',
            'site_settings_hours',
            'site_settings_social',
          ],
        },
      },
    })

    contentMap = toContentMap(items)
  } catch {}

  const header = parseContactPageContent(contentMap.get('contact_page'))
  const general = parseSiteSettingsGeneralContent(contentMap.get('site_settings_general'))
  const hours = parseSiteSettingsHoursContent(contentMap.get('site_settings_hours'))
  const social = parseSiteSettingsSocialContent(contentMap.get('site_settings_social'))

  return (
    <ContactPageClient
      header={header ?? CONTACT_PAGE_DEFAULTS}
      general={general ?? SITE_SETTINGS_GENERAL_DEFAULTS}
      hours={hours ?? SITE_SETTINGS_HOURS_DEFAULTS}
      social={social ?? SITE_SETTINGS_SOCIAL_DEFAULTS}
    />
  )
}
