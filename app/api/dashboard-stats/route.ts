import { NextResponse } from 'next/server'
import { requireApiPermissions } from '@/lib/api-auth'
import { buildDashboardOverviewData } from '@/lib/dashboard-overview'
import { getCachedDashboardOverviewSnapshot } from '@/lib/dashboard-overview-server'

export async function GET() {
  const auth = await requireApiPermissions(['dashboard.view'])
  if (auth.response) return auth.response

  try {
    const permissions = auth.session?.user?.permissions ?? []
    const roleName = auth.session?.user?.role ?? 'User'
    const snapshot = await getCachedDashboardOverviewSnapshot()

    return NextResponse.json(buildDashboardOverviewData(snapshot, permissions, roleName))
  } catch (error) {
    console.error('GET /api/dashboard-stats error:', error)
    return NextResponse.json({ error: 'Failed to fetch dashboard stats' }, { status: 500 })
  }
}
