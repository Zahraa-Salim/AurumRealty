/**
 * NotFoundPage — shown for any unmatched route (404).
 *
 * Branded 404 page consistent with Aurum Realty design system.
 * Links back to home and properties pages.
 */

import Link from 'next/link'
import { getServerLocale } from '@/lib/locale-server'

export default async function NotFound() {
  const locale = await getServerLocale()
  const isAr = locale === 'ar'

  return (
    <main className="w-full bg-white min-h-[70vh] flex items-center justify-center px-4">
      <div className="text-center max-w-[480px]">
        <p className="font-sans text-[12px] font-medium text-mid-gray uppercase tracking-widest mb-6">
          404
        </p>
        <h1 className="font-serif text-[40px] md:text-[48px] text-charcoal leading-[1.1] mb-4">
          {isAr ? 'الصفحة غير موجودة' : 'Page not found'}
        </h1>
        <p className="font-sans text-[16px] text-taupe leading-[1.7] mb-10">
          {isAr
            ? 'الصفحة التي تبحث عنها غير موجودة أو ربما تم نقلها.'
            : 'The page you are looking for does not exist or may have moved.'}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-block bg-gold hover:bg-gold-dark text-charcoal font-sans text-[14px] font-medium px-8 py-3 rounded-full transition-colors duration-200 no-underline"
          >
            {isAr ? 'العودة للرئيسية' : 'Back to home'}
          </Link>
          <Link
            href="/properties"
            className="inline-block bg-transparent border border-charcoal text-charcoal hover:bg-light-gray/30 font-sans text-[14px] font-medium px-8 py-3 rounded-full transition-colors duration-200 no-underline"
            style={{ borderWidth: '0.5px' }}
          >
            {isAr ? 'تصفح العقارات' : 'Browse properties'}
          </Link>
        </div>
      </div>
    </main>
  )
}
