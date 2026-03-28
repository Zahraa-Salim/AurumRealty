'use client'

/**
 * LanguageSwitcher — EN / AR toggle.
 * Sets a `locale` cookie and forces a page reload so the server
 * re-renders with the new locale. Lightweight: no router dependency.
 */

import React, { useEffect, useState } from 'react'
import { getLocaleFromCookie, setLocaleCookie, type Locale } from '@/lib/i18n'

export function LanguageSwitcher() {
  const [locale, setLocale] = useState<Locale>('en')

  useEffect(() => {
    setLocale(getLocaleFromCookie())
  }, [])

  const switchTo = (next: Locale) => {
    if (next === locale) return
    setLocaleCookie(next)
    setLocale(next)
    window.location.reload()
  }

  return (
    <div className="lang-switcher" aria-label="Language switcher">
      <button
        onClick={() => switchTo('en')}
        className={locale === 'en' ? 'active' : ''}
        aria-pressed={locale === 'en'}
      >
        EN
      </button>
      <button
        onClick={() => switchTo('ar')}
        className={locale === 'ar' ? 'active' : ''}
        aria-pressed={locale === 'ar'}
        style={{ fontFamily: 'var(--font-arabic)' }}
      >
        AR
      </button>
    </div>
  )
}
