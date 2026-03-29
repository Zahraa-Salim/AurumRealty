'use client'

import React, { useState, useEffect } from 'react'
import { getLocaleFromCookie, setLocaleCookie, type Locale } from '@/lib/i18n'

export function LanguageSwitcher() {
  const [locale, setLocale] = useState<Locale>('en') // neutral default matches server

  useEffect(() => {
    setLocale(getLocaleFromCookie()) // runs only on client, after hydration
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
        style={{ fontFamily: 'var(--font-arabic)', fontWeight: 600 }}
      >
        ع
      </button>
    </div>
  )
}