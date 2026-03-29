'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  buildDashboardQuickActions,
  getDashboardPermissionState,
  type DashboardOverviewData,
  type DashboardActivityItem,
} from '@/lib/dashboard-overview'

type Props = {
  roleName: string
  permissions: string[]
  userName: string
}

const empty: DashboardOverviewData = {
  statCards: [], taskCards: [], adminSummaryCards: [],
  activityItems: [], generatedAt: '', userName: '', roleName: '', canViewOwnOnly: false,
}

function getGreeting(name: string): string {
  const hour = new Date().getHours()
  const first = name?.split(' ')[0] ?? name ?? 'there'
  if (hour < 12) return `Good morning, ${first}`
  if (hour < 17) return `Good afternoon, ${first}`
  return `Good evening, ${first}`
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60_000)
  if (mins < 2) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days}d ago`
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

const ACTIVITY_LABEL: Record<string, string> = {
  showing: 'Showing request', enquiry: 'Agent enquiry', message: 'Contact message',
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────

export function DashboardOverviewClient({ roleName, permissions, userName }: Props) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [overview, setOverview] = useState<DashboardOverviewData>(empty)

  const permissionState = getDashboardPermissionState(permissions, roleName)
  const quickActions = buildDashboardQuickActions(permissions, roleName)

  useEffect(() => {
    let cancelled = false
    fetch('/api/dashboard-stats', { cache: 'no-store' })
      .then(async res => {
        if (!res.ok) throw new Error('Failed to load dashboard data.')
        return res.json() as Promise<DashboardOverviewData>
      })
      .then(data => { if (!cancelled) setOverview(data) })
      .catch(e => { if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load.') })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })

  return (
    <div className="max-w-5xl mx-auto space-y-6">

      {/* ── WELCOME ── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-1">
        <div>
          <h1 className="font-serif text-[28px] text-charcoal leading-tight">{getGreeting(userName)}</h1>
          <p className="font-sans text-[13px] text-taupe mt-1">{roleName}{overview.canViewOwnOnly ? ' · Viewing your assigned submissions only' : ''}</p>
        </div>
        <p className="font-sans text-[13px] text-taupe pb-0.5">{today}</p>
      </div>

      {error && (
        <div className="px-4 py-3 rounded-sm font-sans text-[13px] bg-error/5 text-error border border-error/20" style={{ borderWidth: '0.5px' }}>
          {error}
        </div>
      )}

      {/* ── STATS ROW ── */}
      {(loading || overview.statCards.length > 0) && (
        <div className="bg-white border border-light-gray rounded-sm" style={{ borderWidth: '0.5px' }}>
          <div className="grid divide-x divide-light-gray" style={{ gridTemplateColumns: `repeat(${loading ? 4 : Math.min(overview.statCards.length, 6)}, 1fr)` }}>
            {loading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="px-6 py-5">
                    <div className="h-7 w-10 bg-light-gray/60 rounded animate-pulse mb-2" />
                    <div className="h-3 w-20 bg-light-gray/40 rounded animate-pulse" />
                  </div>
                ))
              : overview.statCards.map(card => (
                  <Link
                    key={card.label}
                    href={card.link}
                    className="no-underline block px-6 py-5 hover:bg-[#F7F6F3] transition-colors group"
                  >
                    <p className="font-serif text-[30px] leading-none text-charcoal mb-1.5">{card.value}</p>
                    <p className="font-sans text-[11px] text-taupe uppercase tracking-wider leading-snug">{card.label}</p>
                  </Link>
                ))
            }
          </div>
        </div>
      )}

      {/* ── MAIN GRID: activity + sidebar ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left: activity (2/3) */}
        <div className="lg:col-span-2 space-y-6">

          {/* Needs attention */}
          {(loading || overview.taskCards.length > 0) && (
            <Panel title="Needs attention">
              {loading ? (
                <div className="-mx-6 -mb-6">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="px-6 py-4 border-b border-light-gray last:border-0 flex items-center gap-4" style={{ borderWidth: '0 0 0.5px 0' }}>
                      <div className="h-6 w-6 bg-light-gray/60 rounded animate-pulse" />
                      <div className="flex-1">
                        <div className="h-3.5 w-40 bg-light-gray/50 rounded animate-pulse mb-1.5" />
                        <div className="h-3 w-56 bg-light-gray/40 rounded animate-pulse" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="-mx-6 -mb-6">
                  {overview.taskCards.map((task, idx) => (
                    <Link
                      key={task.label}
                      href={task.href}
                      className="no-underline flex items-center gap-5 px-6 py-4 border-b border-light-gray last:border-0 hover:bg-[#F7F6F3] transition-colors group"
                      style={{ borderWidth: idx === overview.taskCards.length - 1 ? '0' : '0 0 0.5px 0' }}
                    >
                      <span className="font-serif text-[24px] leading-none text-charcoal w-8 text-right flex-shrink-0">{task.value}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-sans text-[13px] font-medium text-charcoal">{task.label}</p>
                        <p className="font-sans text-[12px] text-taupe">{task.hint}</p>
                      </div>
                      <svg className="text-taupe group-hover:text-charcoal transition-colors flex-shrink-0" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                    </Link>
                  ))}
                </div>
              )}
            </Panel>
          )}

          {/* Recent activity */}
          <Panel title="Recent activity">
            {!(permissionState.canViewSubmissions || permissionState.canViewOwnSubmissions) ? (
              <p className="font-sans text-[13px] text-taupe">Activity is shown to roles with submissions access.</p>
            ) : loading ? (
              <div className="-mx-6 -mb-6">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="px-6 py-4 border-b border-light-gray last:border-0 flex items-center gap-3" style={{ borderWidth: '0 0 0.5px 0' }}>
                    <div className="w-7 h-7 rounded-full bg-light-gray/50 animate-pulse flex-shrink-0" />
                    <div className="flex-1">
                      <div className="h-3.5 w-3/4 bg-light-gray/50 rounded animate-pulse mb-1.5" />
                      <div className="h-3 w-1/3 bg-light-gray/40 rounded animate-pulse" />
                    </div>
                    <div className="h-3 w-10 bg-light-gray/40 rounded animate-pulse" />
                  </div>
                ))}
              </div>
            ) : overview.activityItems.length === 0 ? (
              <p className="font-sans text-[13px] text-taupe">No recent activity yet.</p>
            ) : (
              <div className="-mx-6 -mb-6">
                {overview.activityItems.map((item, idx) => (
                  <ActivityRow key={item.id} item={item} isLast={idx === overview.activityItems.length - 1} />
                ))}
              </div>
            )}
          </Panel>
        </div>

        {/* Right: quick actions (1/3) */}
        <div className="space-y-6">
          <Panel title="Quick actions">
            {quickActions.length === 0 ? (
              <p className="font-sans text-[13px] text-taupe">No actions available.</p>
            ) : (
              <div className="-mx-6 -mb-6">
                {quickActions.map((action, i) => (
                  <Link
                    key={action.href}
                    href={action.href}
                    className="no-underline flex items-center justify-between px-6 py-3.5 border-b border-light-gray last:border-0 hover:bg-[#F7F6F3] transition-colors group"
                    style={{ borderWidth: i === quickActions.length - 1 ? '0' : '0 0 0.5px 0' }}
                  >
                    <span className={`font-sans text-[13px] ${i === 0 ? 'font-medium text-charcoal' : 'text-charcoal'}`}>{action.label}</span>
                    <svg className="text-taupe group-hover:text-charcoal transition-colors flex-shrink-0" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                  </Link>
                ))}
              </div>
            )}
          </Panel>

          {/* Admin summary */}
          {permissionState.isSuperAdmin && (
            <AdminSummarySection
              loading={loading}
              adminSummaryCards={overview.adminSummaryCards}
            />
          )}
        </div>
      </div>

    </div>
  )
}

// ─── SUB-COMPONENTS ──────────────────────────────────────────────────────────

function ActivityRow({ item, isLast }: { item: DashboardActivityItem; isLast: boolean }) {
  return (
    <Link
      href={item.href}
      className="no-underline flex items-center gap-3 px-6 py-4 hover:bg-[#F7F6F3] transition-colors border-b border-light-gray"
      style={{ borderWidth: isLast ? '0' : '0 0 0.5px 0' }}
    >
      <div className="w-7 h-7 rounded-full bg-light-gray/50 flex items-center justify-center flex-shrink-0">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#1F1F1F" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="8" r="4"/><path d="M4 20c0-3.3 3.6-6 8-6s8 2.7 8 6"/>
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-sans text-[13px] text-charcoal leading-snug truncate">
          <span className="font-medium">{item.personName}</span>
          <span className="text-taupe"> · {ACTIVITY_LABEL[item.type]}</span>
        </p>
        {item.detail && item.type !== 'message' && (
          <p className="font-sans text-[11px] text-taupe truncate">{item.detail}</p>
        )}
      </div>
      <span className="font-sans text-[11px] text-taupe whitespace-nowrap flex-shrink-0">{relativeTime(item.createdAt)}</span>
    </Link>
  )
}

function AdminSummarySection({
  loading,
  adminSummaryCards,
}: {
  loading: boolean
  adminSummaryCards: DashboardOverviewData['adminSummaryCards']
}) {
  return (
    <Panel
      title="System"
      headerRight={
        <Link href="/dashboard/users" className="font-sans text-[12px] text-taupe hover:text-charcoal no-underline transition-colors">
          Manage users →
        </Link>
      }
    >
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="h-3 w-24 bg-light-gray/50 rounded animate-pulse" />
              <div className="h-4 w-8 bg-light-gray/60 rounded animate-pulse" />
            </div>
          ))}
        </div>
      ) : (
        <div className="-mx-6 -mb-6">
          {adminSummaryCards.map((card, i) => (
            <div
              key={card.label}
              className="flex items-center justify-between px-6 py-3.5 border-b border-light-gray last:border-0"
              style={{ borderWidth: i === adminSummaryCards.length - 1 ? '0' : '0 0 0.5px 0' }}
            >
              <span className="font-sans text-[12px] text-taupe uppercase tracking-wider">{card.label}</span>
              <span className="font-serif text-[20px] text-charcoal leading-none">{card.value}</span>
            </div>
          ))}
        </div>
      )}
    </Panel>
  )
}

function Panel({
  title,
  children,
  headerRight,
}: {
  title: string
  children: React.ReactNode
  headerRight?: React.ReactNode
}) {
  return (
    <div className="bg-white rounded-sm border border-light-gray" style={{ borderWidth: '0.5px' }}>
      <div className="px-6 py-4 border-b border-light-gray flex items-center justify-between" style={{ borderWidth: '0 0 0.5px 0' }}>
        <h2 className="font-sans text-[11px] font-medium text-taupe uppercase tracking-wider">{title}</h2>
        {headerRight}
      </div>
      <div className="p-6">{children}</div>
    </div>
  )
}
