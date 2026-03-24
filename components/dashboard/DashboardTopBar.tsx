/**
 * DashboardTopBar — components/dashboard/DashboardTopBar.tsx
 *
 * Sticky top header inside the dashboard content area.
 * Shows: mobile hamburger → breadcrumb trail → page title → user avatar.
 * The hamburger is hidden on desktop (lg+) since the sidebar is always visible.
 * Page title and breadcrumbs are passed as props from DashboardLayout,
 * which resolves them from the current pathname.
 */

'use client'

import React, { Fragment } from 'react'

type TopBarProps = {
  title: string
  breadcrumbs: string[]
  onMenuClick: () => void
}

export function DashboardTopBar({ title, breadcrumbs, onMenuClick }: TopBarProps) {
  return (
    <header
      className="h-[64px] bg-white border-b border-light-gray flex items-center justify-between px-6 sticky top-0 z-30 flex-shrink-0"
      style={{ borderWidth: '0 0 0.5px 0' }}
    >
      <div className="flex items-center gap-4">
        {/* Mobile hamburger */}
        <button
          onClick={onMenuClick}
          className="lg:hidden flex flex-col justify-center gap-[4px] w-6 h-6 bg-transparent border-none p-0 cursor-pointer"
          aria-label="Toggle sidebar"
        >
          <span className="block w-full h-[1px] bg-charcoal" />
          <span className="block w-full h-[1px] bg-charcoal" />
          <span className="block w-full h-[1px] bg-charcoal" />
        </button>

        {/* Breadcrumb + title */}
        <div className="flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-1">
            {breadcrumbs.map((crumb, i) => (
              <Fragment key={i}>
                <span className="font-sans text-[12px] text-taupe">{crumb}</span>
                {i < breadcrumbs.length - 1 && (
                  <span className="font-sans text-[12px] text-mid-gray">/</span>
                )}
              </Fragment>
            ))}
          </div>
          <h1 className="font-serif text-[20px] text-charcoal leading-none m-0">{title}</h1>
        </div>
      </div>

      {/* User avatar */}
      <div className="w-9 h-9 rounded-full bg-light-gray flex items-center justify-center cursor-pointer hover:bg-light-gray/80 transition-colors">
        <span className="font-sans text-[13px] font-medium text-charcoal">AU</span>
      </div>
    </header>
  )
}
