/**
 * PublicLayout — app/(public)/layout.tsx
 *
 * Route group layout that wraps ONLY the public-facing pages.
 * Provides the Navigation header and Footer.
 *
 * The (public) folder is a Next.js route group — the parentheses mean
 * it does NOT affect the URL structure. /about still resolves to /about,
 * not /(public)/about.
 *
 * The dashboard (/dashboard/*) lives outside this group and therefore
 * never gets Navigation or Footer — it has its own layout at
 * app/dashboard/layout.tsx with the sidebar and top bar.
 */

import { Navigation } from '@/components/Navigation'
import { Footer } from '@/components/Footer'

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navigation />
      {/* pt-[64px] offsets the fixed navbar height so content never hides behind it */}
      <div className="flex-1 pt-[64px]">{children}</div>
      <Footer />
    </div>
  )
}
