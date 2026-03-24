import Link from 'next/link'

export function DashboardAccessDenied({
  title = 'Access denied',
  message = 'You do not have permission to view this page.',
}: {
  title?: string
  message?: string
}) {
  return (
    <div className="max-w-4xl mx-auto min-h-[420px] flex items-center justify-center px-6">
      <div className="text-center max-w-[420px]">
        <h1 className="font-serif text-[24px] text-charcoal">{title}</h1>
        <p className="font-sans text-[14px] text-taupe mt-3">
          {message}
        </p>
        <Link
          href="/dashboard"
          className="inline-block mt-6 font-sans text-[14px] text-charcoal hover:text-taupe transition-colors no-underline"
        >
          Back to dashboard
        </Link>
      </div>
    </div>
  )
}

