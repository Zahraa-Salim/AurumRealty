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
