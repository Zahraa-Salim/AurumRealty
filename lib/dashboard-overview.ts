import { hasAnyPermission } from '@/lib/rbac'

export type DashboardStatCard = {
  value: number
  label: string
  link: string
  icon: 'properties' | 'blog' | 'news' | 'messages' | 'showings' | 'users'
  accent: 'gold' | 'charcoal' | 'error' | 'success' | 'taupe'
}

export type DashboardTaskCard = {
  value: number
  label: string
  hint: string
  href: string
  urgent: boolean
}

export type DashboardAdminSummaryCard = {
  value: number
  label: string
}

export type DashboardActivityItem = {
  id: string
  type: 'showing' | 'enquiry' | 'message'
  personName: string
  detail: string
  createdAt: string
  href: string
}

export type DashboardOverviewSnapshot = {
  counts: {
    properties: number
    blogPosts: number
    newsArticles: number
    unreadMessages: number
    newShowings: number
    users: number
    draftProperties: number
    draftBlogPosts: number
    draftNewsArticles: number
    expiringListings: number
    readMessages: number
    confirmedShowings: number
    totalRoles: number
    customRoles: number
    inactiveUsers: number
    systemRoles: number
  }
  recentShowings: Array<{
    id: number
    type: string
    name: string
    createdAt: string
    propertyTitle: string | null
  }>
  recentMessages: Array<{
    id: number
    name: string
    createdAt: string
  }>
  generatedAt: string
}

export type DashboardOverviewData = {
  statCards: DashboardStatCard[]
  taskCards: DashboardTaskCard[]
  adminSummaryCards: DashboardAdminSummaryCard[]
  activityItems: DashboardActivityItem[]
  generatedAt: string
  userName: string
  roleName: string
  canViewOwnOnly: boolean
}

type PermissionState = {
  canViewProperties: boolean
  canCreateProperties: boolean
  canViewBlog: boolean
  canCreateBlog: boolean
  canViewNews: boolean
  canCreateNews: boolean
  canEditPages: boolean
  canViewSubmissions: boolean
  canViewOwnSubmissions: boolean
  canViewUsers: boolean
  canViewRoles: boolean
  canViewSettings: boolean
  isSuperAdmin: boolean
}

export function getDashboardPermissionState(permissions: string[], roleName: string): PermissionState {
  return {
    canViewProperties: hasAnyPermission(permissions, ['properties.view']),
    canCreateProperties: hasAnyPermission(permissions, ['properties.create']),
    canViewBlog: hasAnyPermission(permissions, ['blog.view']),
    canCreateBlog: hasAnyPermission(permissions, ['blog.create']),
    canViewNews: hasAnyPermission(permissions, ['news.view']),
    canCreateNews: hasAnyPermission(permissions, ['news.create']),
    canEditPages: hasAnyPermission(permissions, ['pages.edit']),
    canViewSubmissions: hasAnyPermission(permissions, ['submissions.view']),
    canViewOwnSubmissions: hasAnyPermission(permissions, ['submissions.view.own']),
    canViewUsers: hasAnyPermission(permissions, ['users.view']),
    canViewRoles: hasAnyPermission(permissions, ['roles.view']),
    canViewSettings: hasAnyPermission(permissions, ['settings.view']),
    isSuperAdmin: roleName === 'Super Admin',
  }
}

export function buildDashboardQuickActions(permissions: string[], roleName: string) {
  const state = getDashboardPermissionState(permissions, roleName)
  const canSeeSubmissions = state.canViewSubmissions || state.canViewOwnSubmissions

  return [
    ...(state.canCreateProperties ? [{ label: 'Add property', href: '/dashboard/properties/new' }] : []),
    ...(state.canCreateBlog ? [{ label: 'New blog post', href: '/dashboard/blog/new' }] : []),
    ...(state.canCreateNews ? [{ label: 'New news article', href: '/dashboard/news/new' }] : []),
    ...(state.canEditPages ? [{ label: 'Edit home page', href: '/dashboard/home' }] : []),
    ...(state.canEditPages ? [{ label: 'Edit about page', href: '/dashboard/about' }] : []),
    ...(state.canEditPages ? [{ label: 'Edit services page', href: '/dashboard/services' }] : []),
    ...(canSeeSubmissions ? [{ label: 'Review showing requests', href: '/dashboard/showings' }] : []),
    ...(canSeeSubmissions ? [{ label: 'Review contact messages', href: '/dashboard/contact-messages' }] : []),
    ...(state.canViewUsers || state.canViewRoles ? [{ label: 'Manage users & roles', href: '/dashboard/users' }] : []),
    ...(state.canViewSettings ? [{ label: 'Open site settings', href: '/dashboard/settings' }] : []),
  ]
}

export function buildDashboardOverviewData(
  snapshot: DashboardOverviewSnapshot,
  permissions: string[],
  roleName: string,
  userName = '',
): DashboardOverviewData {
  const state = getDashboardPermissionState(permissions, roleName)
  const { counts } = snapshot
  const canSeeSubmissions = state.canViewSubmissions || state.canViewOwnSubmissions
  const canViewOwnOnly = state.canViewOwnSubmissions && !state.canViewSubmissions

  const statCards: DashboardStatCard[] = [
    ...(state.canViewProperties ? [{ value: counts.properties, label: 'Total properties', link: '/dashboard/properties', icon: 'properties' as const, accent: 'gold' as const }] : []),
    ...(state.canViewBlog ? [{ value: counts.blogPosts, label: 'Published posts', link: '/dashboard/blog', icon: 'blog' as const, accent: 'charcoal' as const }] : []),
    ...(state.canViewNews ? [{ value: counts.newsArticles, label: 'Published news', link: '/dashboard/news', icon: 'news' as const, accent: 'taupe' as const }] : []),
    ...(canSeeSubmissions ? [{ value: counts.unreadMessages, label: 'Unread messages', link: '/dashboard/contact-messages', icon: 'messages' as const, accent: 'error' as const }] : []),
    ...(canSeeSubmissions ? [{ value: counts.newShowings, label: 'New showing requests', link: '/dashboard/showings', icon: 'showings' as const, accent: 'success' as const }] : []),
    ...(state.canViewUsers ? [{ value: counts.users, label: 'Active users', link: '/dashboard/users', icon: 'users' as const, accent: 'charcoal' as const }] : []),
  ]

  const totalDrafts = counts.draftProperties + counts.draftBlogPosts + counts.draftNewsArticles
  const unreadSubmissions = counts.unreadMessages + counts.newShowings
  const pendingFollowUps = counts.readMessages + counts.confirmedShowings

  const draftBreakdown = [
    counts.draftProperties > 0 ? `${counts.draftProperties} property` : '',
    counts.draftBlogPosts > 0 ? `${counts.draftBlogPosts} blog` : '',
    counts.draftNewsArticles > 0 ? `${counts.draftNewsArticles} news` : '',
  ].filter(Boolean)

  const taskCards: DashboardTaskCard[] = [
    ...(canSeeSubmissions
      ? [{
          value: unreadSubmissions,
          label: 'Unread submissions',
          hint: `${counts.newShowings} new showings · ${counts.unreadMessages} unread messages`,
          href: counts.newShowings > 0 ? '/dashboard/showings' : '/dashboard/contact-messages',
          urgent: unreadSubmissions > 0,
        }]
      : []),
    ...((state.canViewProperties || state.canViewBlog || state.canViewNews)
      ? [{
          value: totalDrafts,
          label: 'Drafts awaiting publish',
          hint: draftBreakdown.join(' · ') || 'No drafts waiting right now',
          href: state.canViewProperties ? '/dashboard/properties' : state.canViewBlog ? '/dashboard/blog' : '/dashboard/news',
          urgent: totalDrafts > 0,
        }]
      : []),
    ...(state.canViewProperties
      ? [{
          value: counts.expiringListings,
          label: 'Expiring listings',
          hint: 'Published listings expiring within 30 days',
          href: '/dashboard/properties',
          urgent: counts.expiringListings > 0,
        }]
      : []),
    ...(canSeeSubmissions
      ? [{
          value: pendingFollowUps,
          label: 'Pending follow-ups',
          hint: `${counts.confirmedShowings} confirmed showings · ${counts.readMessages} read messages`,
          href: counts.confirmedShowings > 0 ? '/dashboard/showings' : '/dashboard/contact-messages',
          urgent: pendingFollowUps > 0,
        }]
      : []),
  ]

  const adminSummaryCards: DashboardAdminSummaryCard[] = state.isSuperAdmin
    ? [
        { value: counts.users, label: 'Active users' },
        { value: counts.inactiveUsers, label: 'Inactive users' },
        { value: counts.totalRoles, label: 'Total roles' },
        { value: counts.customRoles, label: 'Custom roles' },
      ]
    : []

  const activityItems: DashboardActivityItem[] = canSeeSubmissions
    ? [
        ...snapshot.recentShowings.map((showing) => ({
          id: `showing-${showing.id}`,
          type: showing.type === 'showing' ? 'showing' as const : 'enquiry' as const,
          personName: showing.name,
          detail: showing.propertyTitle ? `for ${showing.propertyTitle}` : '',
          createdAt: showing.createdAt,
          href: '/dashboard/showings',
        })),
        ...snapshot.recentMessages.map((message) => ({
          id: `message-${message.id}`,
          type: 'message' as const,
          personName: message.name,
          detail: 'sent a contact message',
          createdAt: message.createdAt,
          href: '/dashboard/contact-messages',
        })),
      ]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 8)
    : []

  return {
    statCards,
    taskCards,
    adminSummaryCards,
    activityItems,
    generatedAt: snapshot.generatedAt,
    userName,
    roleName,
    canViewOwnOnly,
  }
}
