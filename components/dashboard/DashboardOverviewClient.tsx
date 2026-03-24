'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  buildDashboardQuickActions,
  getDashboardPermissionState,
  type DashboardOverviewData,
} from '@/lib/dashboard-overview'

type DashboardOverviewClientProps = {
  roleName: string
  permissions: string[]
}

const emptyOverview: DashboardOverviewData = {
  statCards: [],
  taskCards: [],
  adminSummaryCards: [],
  activityItems: [],
  generatedAt: '',
}

export function DashboardOverviewClient({
  roleName,
  permissions,
}: DashboardOverviewClientProps) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [overview, setOverview] = useState<DashboardOverviewData>(emptyOverview)

  const permissionState = getDashboardPermissionState(permissions, roleName)
  const quickActions = buildDashboardQuickActions(permissions, roleName)

  useEffect(() => {
    let cancelled = false

    async function loadOverview() {
      try {
        const res = await fetch('/api/dashboard-stats', { cache: 'no-store' })
        if (!res.ok) {
          throw new Error('Failed to load dashboard overview.')
        }

        const data = await res.json() as DashboardOverviewData
        if (!cancelled) {
          setOverview(data)
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : 'Failed to load dashboard overview.')
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    void loadOverview()

    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col gap-1">
        <p className="font-sans text-[13px] text-taupe m-0">Signed in as {roleName}</p>
        <p className="font-sans text-[13px] text-mid-gray m-0">The page shell renders first, then overview widgets load in the background.</p>
      </div>

      {error && (
        <div className="px-4 py-3 rounded-sm font-sans text-[13px] bg-error/5 text-error border border-error/20" style={{ borderWidth: '0.5px' }}>
          {error}
        </div>
      )}

      <OverviewStatsSection loading={loading} statCards={overview.statCards} />

      {(loading || overview.taskCards.length > 0) && (
        <OverviewTasksSection loading={loading} taskCards={overview.taskCards} />
      )}

      {permissionState.isSuperAdmin && (
        <AdminSummarySection
          loading={loading}
          adminSummaryCards={overview.adminSummaryCards}
          generatedAt={overview.generatedAt}
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <RecentActivitySection
          loading={loading}
          canViewSubmissions={permissionState.canViewSubmissions}
          activityItems={overview.activityItems}
        />
        <QuickActionsSection quickActions={quickActions} />
      </div>
    </div>
  )
}

function OverviewStatsSection({
  loading,
  statCards,
}: {
  loading: boolean
  statCards: DashboardOverviewData['statCards']
}) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={`stats-skeleton-${index}`}
            className="bg-white p-6 rounded-sm border border-light-gray"
            style={{ borderWidth: '0.5px' }}
          >
            <div className="h-9 w-20 bg-light-gray/70 rounded animate-pulse mb-3" />
            <div className="h-4 w-28 bg-light-gray/60 rounded animate-pulse" />
          </div>
        ))}
      </div>
    )
  }

  if (statCards.length === 0) {
    return (
      <Panel title="Overview">
        <p className="font-sans text-[14px] text-taupe m-0">No overview cards are available for this role yet.</p>
      </Panel>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
      {statCards.map((card) => (
        <Link
          key={card.label}
          href={card.link}
          className="no-underline block bg-white p-6 rounded-sm border border-light-gray hover:border-charcoal/30 transition-colors"
          style={{ borderWidth: '0.5px' }}
        >
          <p className="font-sans text-[32px] font-medium text-charcoal mb-1">{card.value}</p>
          <p className="font-sans text-[13px] text-taupe">{card.label}</p>
        </Link>
      ))}
    </div>
  )
}

function OverviewTasksSection({
  loading,
  taskCards,
}: {
  loading: boolean
  taskCards: DashboardOverviewData['taskCards']
}) {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="font-serif text-[24px] text-charcoal m-0">My tasks</h2>
        <p className="font-sans text-[13px] text-taupe mt-1 mb-0">The most important items that still need attention.</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={`tasks-skeleton-${index}`}
              className="bg-white p-6 rounded-sm border border-light-gray"
              style={{ borderWidth: '0.5px' }}
            >
              <div className="h-8 w-16 bg-light-gray/70 rounded animate-pulse mb-3" />
              <div className="h-4 w-24 bg-light-gray/60 rounded animate-pulse mb-3" />
              <div className="h-10 w-full bg-light-gray/50 rounded animate-pulse" />
            </div>
          ))}
        </div>
      ) : taskCards.length === 0 ? (
        <Panel title="My tasks">
          <p className="font-sans text-[14px] text-taupe m-0">No task widgets are available for this role yet.</p>
        </Panel>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          {taskCards.map((task) => (
            <Link
              key={task.label}
              href={task.href}
              className="no-underline block bg-white p-6 rounded-sm border border-light-gray hover:border-charcoal/30 transition-colors"
              style={{ borderWidth: '0.5px' }}
            >
              <p className="font-sans text-[30px] font-medium text-charcoal mb-1">{task.value}</p>
              <p className="font-sans text-[14px] text-charcoal mb-2">{task.label}</p>
              <p className="font-sans text-[12px] text-taupe leading-[1.6] m-0">{task.hint}</p>
            </Link>
          ))}
        </div>
      )}
    </section>
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
    <Panel title="Admin summary">
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={`admin-skeleton-${index}`} className="bg-[#F7F6F3] rounded-sm p-5">
              <div className="h-8 w-16 bg-light-gray/70 rounded animate-pulse mb-3" />
              <div className="h-4 w-24 bg-light-gray/60 rounded animate-pulse" />
            </div>
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
            {adminSummaryCards.map((card) => (
              <div key={card.label} className="bg-[#F7F6F3] rounded-sm p-5">
                <p className="font-sans text-[28px] font-medium text-charcoal mb-1">{card.value}</p>
                <p className="font-sans text-[13px] text-taupe m-0">{card.label}</p>
              </div>
            ))}
          </div>
          {generatedAt && (
            <div className="mt-5 pt-5 border-t border-light-gray" style={{ borderWidth: '0.5px 0 0 0' }}>
              <p className="font-sans text-[13px] text-taupe m-0">Stats cache refresh: {formatDateTime(generatedAt)}</p>
            </div>
          )}
        </>
      )}
    </Panel>
  )
}

function RecentActivitySection({
  loading,
  canViewSubmissions,
  activityItems,
}: {
  loading: boolean
  canViewSubmissions: boolean
  activityItems: DashboardOverviewData['activityItems']
}) {
  return (
    <div className="lg:col-span-2">
      <Panel title="Recent activity">
        {!canViewSubmissions ? (
          <p className="font-sans text-[14px] text-taupe m-0">Recent activity is only shown to roles with submissions access.</p>
        ) : loading ? (
          <div className="-m-6 mt-0">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={`activity-skeleton-${index}`}
                className="p-5 border-light-gray"
                style={{ borderWidth: index === 3 ? '0' : '0 0 0.5px 0' }}
              >
                <div className="h-4 w-full bg-light-gray/60 rounded animate-pulse mb-2" />
                <div className="h-3 w-28 bg-light-gray/50 rounded animate-pulse" />
              </div>
            ))}
          </div>
        ) : activityItems.length === 0 ? (
          <p className="font-sans text-[14px] text-taupe m-0">No recent activity yet.</p>
        ) : (
          <div className="-m-6 mt-0">
            {activityItems.map((item, index) => (
              <div
                key={item.id}
                className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-light-gray hover:bg-light-gray/5 transition-colors"
                style={{ borderWidth: index === activityItems.length - 1 ? '0' : '0 0 0.5px 0' }}
              >
                <p className="font-sans text-[14px] text-charcoal m-0">
                  <span className="font-medium">System</span> received {item.message}
                </p>
                <span className="font-sans text-[12px] text-taupe whitespace-nowrap">{formatDateTime(item.createdAt)}</span>
              </div>
            ))}
          </div>
        )}
      </Panel>
    </div>
  )
}

function QuickActionsSection({
  quickActions,
}: {
  quickActions: ReturnType<typeof buildDashboardQuickActions>
}) {
  return (
    <Panel title="Quick actions">
      {quickActions.length === 0 ? (
        <p className="font-sans text-[14px] text-taupe m-0">No quick actions are available for this role yet.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {quickActions.map((action, index) => (
            <Link
              key={action.href}
              href={action.href}
              className={`w-full text-center font-sans text-[13px] font-medium py-2.5 rounded-full transition-colors no-underline ${
                index === 0
                  ? 'bg-gold hover:bg-gold-dark text-charcoal'
                  : 'bg-white hover:bg-light-gray/20 text-charcoal border border-charcoal'
              }`}
              style={{ borderWidth: index === 0 ? undefined : '0.5px' }}
            >
              {action.label}
            </Link>
          ))}
        </div>
      )}
    </Panel>
  )
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-sm border border-light-gray h-fit" style={{ borderWidth: '0.5px' }}>
      <div className="p-6 border-b border-light-gray" style={{ borderWidth: '0 0 0.5px 0' }}>
        <h2 className="font-serif text-[18px] text-charcoal m-0">{title}</h2>
      </div>
      <div className="p-6">{children}</div>
    </div>
  )
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}
