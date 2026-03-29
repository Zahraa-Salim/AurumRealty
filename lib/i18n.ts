/**
 * lib/i18n.ts
 *
 * Locale utilities for EN/AR bilingual support.
 *
 * Strategy: parallel columns — Arabic translations stored alongside
 * English in the same DB row (e.g. title / titleAr, body / bodyAr).
 * If an Arabic value is missing the English value is used as fallback.
 *
 * The `localise()` helper applies this logic everywhere in one place.
 */

export type Locale = 'en' | 'ar'
export const LOCALES: Locale[] = ['en', 'ar']
export const DEFAULT_LOCALE: Locale = 'en'

/** Pick Arabic value if locale is 'ar' and the value is non-empty, else English. */
export function localise(en: string | null | undefined, ar: string | null | undefined, locale: Locale): string {
  if (locale === 'ar' && ar && ar.trim()) return ar.trim()
  return (en ?? '').trim()
}

/** Same but for arrays (e.g. features, paragraphs). */
export function localiseArray(en: string[], ar: string[] | null | undefined, locale: Locale): string[] {
  if (locale === 'ar' && Array.isArray(ar) && ar.length > 0) return ar
  return en
}

/** Determine locale from cookie value (for client components). */
export function getLocaleFromCookie(): Locale {
  if (typeof document === 'undefined') return DEFAULT_LOCALE
  const match = document.cookie.match(/(?:^|;\s*)locale=([^;]+)/)
  const raw = match?.[1]
  return raw === 'ar' ? 'ar' : 'en'
}

/** Set locale cookie. */
export function setLocaleCookie(locale: Locale) {
  document.cookie = `locale=${locale};path=/;max-age=${60 * 60 * 24 * 365};SameSite=Lax`
}

/** Read locale from Next.js cookie in server context (read from request headers). */
export function getLocaleFromCookieHeader(cookieHeader: string | null): Locale {
  if (!cookieHeader) return DEFAULT_LOCALE
  const match = cookieHeader.match(/(?:^|;\s*)locale=([^;]+)/)
  const raw = match?.[1]
  return raw === 'ar' ? 'ar' : 'en'
}

/** RTL direction for the locale. */
export function getDir(locale: Locale): 'ltr' | 'rtl' {
  return locale === 'ar' ? 'rtl' : 'ltr'
}

/** Human-readable label for locale switcher. */
export const LOCALE_LABELS: Record<Locale, string> = {
  en: 'EN',
  ar: 'AR',
}

// ── Lookup maps for DB-stored English enum values ─────────────────────────────

/** Property status → Arabic */
export const STATUS_AR: Record<string, string> = {
  'For Sale':        'للبيع',
  'For Rent':        'للإيجار',
  'New Development': 'مشروع جديد',
}

/** Property type → Arabic */
export const TYPE_AR: Record<string, string> = {
  'Penthouse': 'بنتهاوس',
  'Estate':    'قصر',
  'Villa':     'فيلا',
  'Apartment': 'شقة',
  'Townhouse': 'تاون هاوس',
}

/** Neighbourhood name → Arabic */
export const NEIGHBOURHOOD_AR: Record<string, string> = {
  'Downtown':              'وسط المدينة',
  'Downtown Premium':      'وسط المدينة الراقي',
  'Riverside':             'واجهة النهر',
  'Hillside':              'المنحدر',
  'Harbourfront':          'واجهة الميناء',
  'Garden Quarter':        'حي الحدائق',
  'Financial District':    'الحي المالي',
  'Beachfront District':   'حي الواجهة الشاطئية',
  'Arts Quarter':          'حي الفنون',
  'Historic District':     'الحي التاريخي',
  'Mountain View Estates': 'عقارات إطلالة الجبل',
  'Westside Premium':      'الجانب الغربي الراقي',
  'Lakeside Residences':   'مساكن بحيرة',
  'Marina District':       'حي المارينا',
  'Heritage Quarter':      'حي التراث',
}

/** Blog topic → Arabic */
export const TOPIC_AR: Record<string, string> = {
  'Market outlook': 'توقعات السوق',
  'Investment':     'الاستثمار',
  'Buyer insight':  'رؤى المشترين',
  'Guides':         'أدلة',
}

/** News category → Arabic */
export const CATEGORY_AR: Record<string, string> = {
  'Company news':    'أخبار الشركة',
  'Market update':   'تحديث السوق',
  'Awards':          'جوائز',
  'Industry insight':'رؤى الصناعة',
  'Transaction':     'صفقة',
}

/** Author role → Arabic */
export const AUTHOR_ROLE_AR: Record<string, string> = {
  'Sarah Johnson': 'المدير العام',
  'Michael Chen':  'وكيل أول',
  'Emily Brooks':  'متخصص استثمار',
}

/**
 * Translate a value using a lookup map when locale is Arabic.
 * Falls back to the original value if no translation exists.
 */
export function localiseLabel(value: string, map: Record<string, string>, locale: Locale): string {
  if (locale !== 'ar') return value
  return map[value] ?? value
}

/**
 * Translate a readTime string like "6 min read" → "٦ دقائق قراءة".
 * Returns the original if locale is English or format doesn't match.
 */
export function localiseReadTime(readTime: string | null | undefined, locale: Locale): string | null {
  if (!readTime || locale !== 'ar') return readTime ?? null
  const match = readTime.match(/(\d+)/)
  if (!match) return readTime
  return `${match[1]} دقائق قراءة`
}
