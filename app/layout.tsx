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

export async function generateMetadata(): Promise<Metadata> {
  const cookieStore = await cookies()
  const locale = cookieStore.get('locale')?.value === 'ar' ? 'ar' : 'en'
  const isAr = locale === 'ar'

  return {
    title: {
      default: 'Aurum Realty',
      template: '%s | Aurum Realty',
    },
    description: 'Luxury properties for discerning buyers. Founded 2010.',
    icons: {
      icon: [
        isAr
          ? { url: '/favicon-ar.svg', type: 'image/svg+xml' }
          : { url: '/favicon.ico', sizes: '32x32', type: 'image/x-icon' },
        { url: isAr ? '/favicon-ar.svg' : '/icon.svg', type: 'image/svg+xml' },
      ],
      shortcut: isAr ? '/favicon-ar.svg' : '/favicon.ico',
      apple:    isAr ? '/favicon-ar.svg' : '/favicon.ico',
    },
  }
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Read locale from cookie — this runs server-side on every request
  const cookieStore = await cookies()
  const localeCookie = cookieStore.get('locale')?.value ?? null
  const locale = localeCookie === 'ar' ? 'ar' : 'en'

  return (
    <html lang={locale}>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
          crossOrigin="anonymous"
        />
      </head>
      <body>
        <AuthSessionProvider>{children}</AuthSessionProvider>
      </body>
    </html>
  )
}
