'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { AurumLogo } from '@/components/AurumLogo'
import { DASHBOARD_NAV_ITEMS, hasAnyPermission } from '@/lib/rbac'

type SidebarProps = { isOpen: boolean; onClose: () => void }

export function DashboardSidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const permissions = session?.user?.permissions ?? []

  const visibleItems = DASHBOARD_NAV_ITEMS.filter(item => hasAnyPermission(permissions, item.anyPermissions ?? []))
  const sections = Array.from(new Set(visibleItems.map(item => item.section)))

  const isActive = (path: string) =>
    path === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(path)

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-charcoal/20 z-40 lg:hidden" onClick={onClose} />
      )}

      <aside
        className={`
          fixed top-0 left-0 bottom-0 w-[240px] bg-[#FAF8F5]
          border-r border-light-gray z-50 flex flex-col
          transition-transform duration-300 ease-in-out lg:translate-x-0
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
        style={{ borderWidth: '0 0.5px 0 0' }}
      >
        <div className="h-[64px] flex items-center px-5 border-b border-light-gray flex-shrink-0" style={{ borderWidth: '0 0 0.5px 0' }}>
          <Link href="/dashboard" className="no-underline hover:opacity-75 transition-opacity duration-150">
            <AurumLogo variant="light" height={28} />
          </Link>
        </div>

        <div className="flex-1 py-2 overflow-y-auto sidebar-scroll" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {sections.map(section => (
            <div key={section}>
              <div className="px-5 pt-6 pb-1.5 flex items-center gap-3">
                <span className="font-sans text-[10px] font-semibold text-mid-gray uppercase tracking-widest whitespace-nowrap">
                  {section}
                </span>
                <span className="flex-1 h-px bg-light-gray" />
              </div>

              {visibleItems
                .filter(item => item.section === section)
                .map(item => {
                  const active = isActive(item.to)

                  return (
                    <Link
                      key={item.to}
                      href={item.to}
                      onClick={() => {
                        if (typeof window !== 'undefined' && window.innerWidth < 1024) onClose()
                      }}
                      className={`
                        relative flex items-center h-[38px] px-5 mx-2 rounded-sm
                        font-sans text-[13px] no-underline transition-all duration-150
                        ${active
                          ? 'bg-gold/10 text-charcoal font-semibold'
                          : 'text-taupe font-normal hover:bg-light-gray/40 hover:text-charcoal'
                        }
                      `}
                    >
                      {active && (
                        <span className="absolute left-0 top-[6px] bottom-[6px] w-[3px] bg-gold rounded-r-full" />
                      )}
                      <span className={active ? 'pl-2' : ''}>{item.label}</span>
                    </Link>
                  )
                })}
            </div>
          ))}

          <div className="h-4" />
        </div>

        <div className="p-3 border-t border-light-gray flex-shrink-0" style={{ borderWidth: '0.5px 0 0 0' }}>
          <Link
            href="/dashboard/profile"
            className={`
              flex items-center gap-3 no-underline rounded-sm px-3 py-2
              transition-all duration-150
              ${pathname === '/dashboard/profile'
                ? 'bg-gold/10 text-charcoal'
                : 'hover:bg-light-gray/40 text-charcoal'
              }
            `}
          >
            <div className="w-8 h-8 rounded-full bg-gold/20 border border-gold/30 flex items-center justify-center flex-shrink-0" style={{ borderWidth: '0.5px' }}>
              <span className="font-sans text-[12px] font-semibold text-charcoal">
                {session?.user?.name?.split(' ').map(part => part[0]).join('').slice(0, 2).toUpperCase() || 'AU'}
              </span>
            </div>
            <div className="flex flex-col overflow-hidden min-w-0">
              <span className="font-sans text-[13px] font-medium text-charcoal truncate leading-tight">
                {session?.user?.name || 'Dashboard User'}
              </span>
              <span className="font-sans text-[11px] text-taupe truncate leading-tight">
                {session?.user?.email || 'dashboard@aurumrealty.com'}
              </span>
            </div>
            <svg className="w-3 h-3 text-taupe flex-shrink-0 ml-auto" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m9 18 6-6-6-6" />
            </svg>
          </Link>
        </div>
      </aside>
    </>
  )
}
