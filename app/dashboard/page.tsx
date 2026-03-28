import React from 'react'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { DashboardOverviewClient } from '@/components/dashboard/DashboardOverviewClient'
import { DashboardAccessDenied } from '@/components/dashboard/DashboardAccessDenied'
import { hasAnyPermission } from '@/lib/rbac'

export default async function DashboardOverviewPage() {
  const session = await getServerSession(authOptions)
  const permissions = session?.user?.permissions ?? []

  if (!hasAnyPermission(permissions, ['dashboard.view'])) {
    return (
      <DashboardAccessDenied
        message="You do not have permission to view the dashboard overview."
      />
    )
  }

  return (
    <DashboardOverviewClient
      roleName={session?.user?.role ?? 'User'}
      userName={session?.user?.name ?? ''}
      permissions={permissions}
    />
  )
}
