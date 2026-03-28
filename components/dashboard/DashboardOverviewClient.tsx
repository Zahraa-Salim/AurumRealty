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

function initials(name: string): string {
  return name.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase()
}

// ─── ICONS ───────────────────────────────────────────────────────────────────

function IconProperties() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z"/><path d="M9 21V12h6v9"/>
    </svg>
  )
}
function IconBlog() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
    </svg>
  )
}
function IconNews() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 0-2 2zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/><path d="M18 14h-8"/><path d="M15 18h-5"/><path d="M10 6h8v4h-8z"/>
    </svg>
  )
}
function IconMessages() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
    </svg>
  )
}
function IconShowings() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  )
}
function IconUsers() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  )
}

const STAT_ICONS: Record<string, React.ReactNode> = {
  properties: <IconProperties />, blog: <IconBlog />, news: <IconNews />,
  messages: <IconMessages />, showings: <IconShowings />, users: <IconUsers />,
}

const ACCENT_STYLES: Record<string, { border: string; iconBg: string; iconColor: string }> = {
  gold:     { border: 'border-l-gold',    iconBg: 'bg-gold/10',    iconColor: 'text-gold' },
  charcoal: { border: 'border-l-charcoal/40', iconBg: 'bg-charcoal/5', iconColor: 'text-charcoal' },
  error:    { border: 'border-l-error',   iconBg: 'bg-error/10',   iconColor: 'text-error' },
  success:  { border: 'border-l-success', iconBg: 'bg-success/10', iconColor: 'text-success' },
  taupe:    { border: 'border-l-taupe/40',iconBg: 'bg-taupe/10',   iconColor: 'text-taupe' },
}

const ACTIVITY_DOT: Record<string, string> = {
  showing: 'bg-success', enquiry: 'bg-gold', message: 'bg-charcoal/50',
}
const ACTIVITY_LABEL: Record<string, string> = {
  showing: 'requested a showing', enquiry: 'sent an agent enquiry', message: 'sent a contact message',
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
    <div className="max-w-6xl mx-auto space-y-6">

      {/* ── WELCOME BAR ── */}
      <div className="bg-cream rounded-sm px-7 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-light-gray" style={{ borderWidth: '0.5px' }}>
        <div>
          <h1 className="font-serif text-[26px] text-charcoal leading-tight mb-0.5">{getGreeting(userName)}</h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="font-sans text-[12px] font-medium px-2.5 py-0.5 rounded-full bg-charcoal/8 text-charcoal border border-charcoal/10" style={{ borderWidth: '0.5px' }}>
              {roleName}
            </span>
            {overview.canViewOwnOnly && (
              <span className="font-sans text-[11px] text-taupe">· Viewing your assigned submissions only</span>
            )}
          </div>
        </div>
        <div className="text-right">
          <p className="font-sans text-[13px] text-charcoal font-medium">{today}</p>
          {overview.generatedAt && !loading && (
            <p className="font-sans text-[11px] text-taupe mt-0.5">Stats refreshed {relativeTime(overview.generatedAt)}</p>
          )}
        </div>
      </div>

      {error && (
        <div className="px-4 py-3 rounded-sm font-sans text-[13px] bg-error/5 text-error border border-error/20" style={{ borderWidth: '0.5px' }}>
          {error}
        </div>
      )}

      {/* ── STAT CARDS ── */}
      {(loading || overview.statCards.length > 0) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white p-5 rounded-sm border border-light-gray border-l-4 border-l-light-gray" style={{ borderWidth: '0.5px' }}>
                  <div className="flex justify-between items-start mb-3">
                    <div className="h-9 w-16 bg-light-gray/60 rounded animate-pulse" />
                    <div className="h-8 w-8 bg-light-gray/40 rounded-sm animate-pulse" />
                  </div>
                  <div className="h-3.5 w-28 bg-light-gray/50 rounded animate-pulse" />
                </div>
              ))
            : overview.statCards.map(card => {
                const accent = ACCENT_STYLES[card.accent] ?? ACCENT_STYLES.charcoal
                return (
                  <Link
                    key={card.label}
                    href={card.link}
                    className={`no-underline block bg-white p-5 rounded-sm border border-light-gray border-l-4 ${accent.border} hover:shadow-hover transition-shadow group`}
                    style={{ borderWidth: '0.5px', borderLeftWidth: '3px' }}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <p className="font-serif text-[36px] leading-none text-charcoal">{card.value}</p>
                      <div className={`w-9 h-9 rounded-sm flex items-center justify-center ${accent.iconBg} ${accent.iconColor} flex-shrink-0`}>
                        {STAT_ICONS[card.icon]}
                      </div>
                    </div>
                    <p className="font-sans text-[12px] text-taupe uppercase tracking-wider">{card.label}</p>
                    <p className="font-sans text-[12px] text-gold mt-2 opacity-0 group-hover:opacity-100 transition-opacity">View all →</p>
                  </Link>
                )
              })
          }
        </div>
      )}

      {/* ── TASK CARDS ── */}
      {(loading || overview.taskCards.length > 0) && (
        <section className="space-y-3">
          <div className="flex items-baseline gap-3">
            <h2 className="font-serif text-[20px] text-charcoal">Needs attention</h2>
            <p className="font-sans text-[12px] text-taupe">Items requiring action</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {loading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="bg-white p-5 rounded-sm border border-light-gray" style={{ borderWidth: '0.5px' }}>
                    <div className="h-8 w-12 bg-light-gray/60 rounded animate-pulse mb-2" />
                    <div className="h-3.5 w-24 bg-light-gray/50 rounded animate-pulse mb-3" />
                    <div className="h-3 w-full bg-light-gray/40 rounded animate-pulse" />
                  </div>
                ))
              : overview.taskCards.map(task => (
                  <Link
                    key={task.label}
                    href={task.href}
                    className="no-underline block bg-white rounded-sm border hover:shadow-hover transition-shadow"
                    style={{
                      borderWidth: '0.5px',
                      borderLeftWidth: '3px',
                      borderLeftColor: task.urgent ? (task.value > 5 ? '#D32F2F' : '#D4AF37') : '#388E3C',
                    }}
                  >
                    <div className="p-5">
                      <p className={`font-serif text-[32px] leading-none mb-1 ${task.urgent ? (task.value > 5 ? 'text-error' : 'text-gold') : 'text-success'}`}>
                        {task.value}
                      </p>
                      <p className="font-sans text-[13px] font-medium text-charcoal mb-1">{task.label}</p>
                      <p className="font-sans text-[11px] text-taupe leading-[1.5]">{task.hint}</p>
                      <p className="font-sans text-[11px] text-gold mt-3">Review →</p>
                    </div>
                  </Link>
                ))
            }
          </div>
        </section>
      )}

      {/* ── ACTIVITY + QUICK ACTIONS ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Recent activity */}
        <div className="lg:col-span-2">
          <Panel title="Recent activity">
            {!(permissionState.canViewSubmissions || permissionState.canViewOwnSubmissions) ? (
              <p className="font-sans text-[13px] text-taupe">Recent activity is only shown to roles with submissions access.</p>
            ) : loading ? (
              <div className="-mx-6 -mb-6">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="px-6 py-4 border-b border-light-gray last:border-0 flex items-center gap-3" style={{ borderWidth: '0 0 0.5px 0' }}>
                    <div className="w-8 h-8 rounded-full bg-light-gray/50 animate-pulse flex-shrink-0" />
                    <div className="flex-1">
                      <div className="h-3.5 w-3/4 bg-light-gray/50 rounded animate-pulse mb-1.5" />
                      <div className="h-3 w-1/3 bg-light-gray/40 rounded animate-pulse" />
                    </div>
                    <div className="h-3 w-12 bg-light-gray/40 rounded animate-pulse" />
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

        {/* Quick actions */}
        <QuickActionsSection quickActions={quickActions} />
      </div>

      {/* ── ADMIN SUMMARY ── */}
      {permissionState.isSuperAdmin && (
        <AdminSummarySection
          loading={loading}
          adminSummaryCards={overview.adminSummaryCards}
          generatedAt={overview.generatedAt}
        />
      )}

    </div>
  )
}

// ─── SUB-COMPONENTS ──────────────────────────────────────────────────────────

function ActivityRow({ item, isLast }: { item: DashboardActivityItem; isLast: boolean }) {
  return (
    <Link
      href={item.href}
      className="no-underline flex items-center gap-3 px-6 py-4 hover:bg-light-gray/10 transition-colors border-b border-light-gray"
      style={{ borderWidth: isLast ? '0' : '0 0 0.5px 0' }}
    >
      {/* Avatar */}
      <div className="w-8 h-8 rounded-full bg-charcoal/8 flex items-center justify-center flex-shrink-0">
        <span className="font-sans text-[11px] font-medium text-charcoal">{initials(item.personName)}</span>
      </div>
      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="font-sans text-[13px] text-charcoal leading-snug">
          <span className="font-medium">{item.personName}</span>
          {' '}
          <span className="text-taupe">{ACTIVITY_LABEL[item.type]}</span>
          {item.detail && item.type !== 'message' && (
            <span className="text-taupe"> {item.detail}</span>
          )}
        </p>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${ACTIVITY_DOT[item.type]}`} />
          <span className="font-sans text-[11px] text-taupe capitalize">{item.type === 'enquiry' ? 'Agent enquiry' : item.type === 'showing' ? 'Showing request' : 'Message'}</span>
        </div>
      </div>
      {/* Time */}
      <span className="font-sans text-[11px] text-taupe whitespace-nowrap flex-shrink-0">{relativeTime(item.createdAt)}</span>
    </Link>
  )
}

function QuickActionsSection({ quickActions }: { quickActions: { label: string; href: string }[] }) {
  return (
    <Panel title="Quick actions">
      {quickActions.length === 0 ? (
        <p className="font-sans text-[13px] text-taupe">No quick actions available for this role.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {quickActions.map((action, i) => (
            <Link
              key={action.href}
              href={action.href}
              className={`w-full text-center font-sans text-[13px] font-medium py-2.5 rounded-full transition-colors no-underline ${
                i === 0
                  ? 'bg-gold hover:bg-gold-dark text-charcoal'
                  : 'bg-white hover:bg-light-gray/30 text-charcoal border border-charcoal/20'
              }`}
              style={{ borderWidth: i === 0 ? undefined : '0.5px' }}
            >
              {action.label}
            </Link>
          ))}
        </div>
      )}
    </Panel>
  )
}

function AdminSummarySection({
  loading,
  adminSummaryCards,
  generatedAt,
}: {
  loading: boolean
  adminSummaryCards: DashboardOverviewData['adminSummaryCards']
  generatedAt: string
}) {
  return (
    <Panel
      title="System overview"
      headerRight={
        <Link href="/dashboard/users" className="font-sans text-[12px] text-gold hover:text-gold-dark no-underline transition-colors">
          Manage →
        </Link>
      }
    >
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-light-gray/20 rounded-sm p-4">
              <div className="h-8 w-12 bg-light-gray/60 rounded animate-pulse mb-2" />
              <div className="h-3 w-20 bg-light-gray/50 rounded animate-pulse" />
            </div>
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {adminSummaryCards.map(card => (
              <div key={card.label} className="bg-light-gray/20 rounded-sm p-4">
                <p className="font-serif text-[28px] text-charcoal leading-none mb-1">{card.value}</p>
                <p className="font-sans text-[11px] text-taupe uppercase tracking-wider">{card.label}</p>
              </div>
            ))}
          </div>
          {generatedAt && (
            <p className="font-sans text-[11px] text-taupe mt-4 pt-4 border-t border-light-gray" style={{ borderWidth: '0.5px 0 0 0' }}>
              Cache refreshed: {new Date(generatedAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
            </p>
          )}
        </>
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
    <div className="bg-white rounded-sm border border-light-gray h-fit" style={{ borderWidth: '0.5px' }}>
      <div className="px-6 py-4 border-b border-light-gray flex items-center justify-between" style={{ borderWidth: '0 0 0.5px 0' }}>
        <h2 className="font-serif text-[17px] text-charcoal">{title}</h2>
        {headerRight}
      </div>
      <div className="p-6">{children}</div>
    </div>
  )
}
