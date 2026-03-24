/**
 * RootLayout — app/layout.tsx
 *
 * Top-level HTML shell for every route (public, dashboard, login).
 * Favicon declared here via metadata.icons so it applies universally.
 * Uses both .ico (broad browser support) and .svg (modern browsers).
 *
 * Navigation/Footer → app/(public)/layout.tsx
 * Dashboard shell  → app/dashboard/layout.tsx
 * Auth pages       → app/(auth)/layout.tsx
 */

import type { Metadata } from 'next'
import './styles/globals.css'
import { AuthSessionProvider } from '@/components/AuthSessionProvider'

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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthSessionProvider>{children}</AuthSessionProvider>
      </body>
    </html>
  )
}
