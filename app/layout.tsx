/**
 * RootLayout — app/layout.tsx
 *
 * Reads the `locale` cookie server-side to set dir and lang on <html>.
 * This ensures Arabic pages are RTL without a client round-trip.
 */

import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import './styles/globals.css'
import { AuthSessionProvider } from '@/components/AuthSessionProvider'
import { getLocaleFromCookieHeader, getDir } from '@/lib/i18n'

export const metadata: Metadata = {
  title: {
    default: 'Aurum Realty',
    template: '%s | Aurum Realty',
  },
  description: 'Luxury properties for discerning buyers. Founded 2010.',
  icons: {
    icon: [
      { url: '/favicon.ico',  sizes: '32x32', type: 'image/x-icon' },
      { url: '/icon.svg',     type: 'image/svg+xml' },
    ],
    shortcut: '/favicon.ico',
    apple: '/favicon.ico',
  },
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Read locale from cookie — this runs server-side on every request
  const cookieStore = await cookies()
  const localeCookie = cookieStore.get('locale')?.value ?? null
  const locale = localeCookie === 'ar' ? 'ar' : 'en'
  const dir = getDir(locale)

  return (
    <html lang={locale} dir={dir}>
      <body>
        <AuthSessionProvider>{children}</AuthSessionProvider>
      </body>
    </html>
  )
}
