/**
 * ErrorPage — global error boundary for unexpected runtime errors.
 *
 * Next.js requires 'use client' for error.tsx.
 * Shows a branded error message with a retry button and link home.
 */

'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <main className="w-full bg-white min-h-[70vh] flex items-center justify-center px-4">
      <div className="text-center max-w-[480px]">
        <p className="font-sans text-[12px] font-medium text-mid-gray uppercase tracking-widest mb-6">
          Something went wrong
        </p>
        <h1 className="font-serif text-[40px] text-charcoal leading-[1.1] mb-4">
          Unexpected error
        </h1>
        <p className="font-sans text-[16px] text-taupe leading-[1.7] mb-10">
          We apologise for the inconvenience. Please try again or return to the homepage.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="inline-block bg-gold hover:bg-gold-dark text-charcoal font-sans text-[14px] font-medium px-8 py-3 rounded-full transition-colors duration-200 border-none cursor-pointer"
          >
            Try again
          </button>
          <Link
            href="/"
            className="inline-block bg-transparent border border-charcoal text-charcoal hover:bg-light-gray/30 font-sans text-[14px] font-medium px-8 py-3 rounded-full transition-colors duration-200 no-underline"
            style={{ borderWidth: '0.5px' }}
          >
            Back to home
          </Link>
        </div>
      </div>
    </main>
  )
}
