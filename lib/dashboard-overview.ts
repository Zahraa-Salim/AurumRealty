import { hasAnyPermission } from '@/lib/rbac'

export type DashboardStatCard = {
  value: number
  label: string
  link: string
}

export type DashboardTaskCard = {
  value: number
  label: string
  hint: string
  href: string
}

export type DashboardAdminSummaryCard = {
  value: number
  label: string
}

export type DashboardActivityItem = {
  id: string
  message: string
  createdAt: string
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
    canViewUsers: hasAnyPermission(permissions, ['users.view']),
    canViewRoles: hasAnyPermission(permissions, ['roles.view']),
    canViewSettings: hasAnyPermission(permissions, ['settings.view']),
    isSuperAdmin: roleName === 'Super Admin',
  }
}

export function buildDashboardQuickActions(permissions: string[], roleName: string) {
  const state = getDashboardPermissionState(permissions, roleName)

  return [
    ...(state.canCreateProperties ? [{ label: 'Add property', href: '/dashboard/properties/new' }] : []),
    ...(state.canCreateBlog ? [{ label: 'New blog post', href: '/dashboard/blog/new' }] : []),
    ...(state.canCreateNews ? [{ label: 'New news article', href: '/dashboard/news/new' }] : []),
    ...(state.canEditPages ? [{ label: 'Edit home page', href: '/dashboard/home' }] : []),
    ...(state.canEditPages ? [{ label: 'Edit about page', href: '/dashboard/about' }] : []),
    ...(state.canEditPages ? [{ label: 'Edit services page', href: '/dashboard/services' }] : []),
    ...(state.canViewSubmissions ? [{ label: 'Review showing requests', href: '/dashboard/showings' }] : []),
    ...(state.canViewSubmissions ? [{ label: 'Review contact messages', href: '/dashboard/contact-messages' }] : []),
    ...(state.canViewUsers || state.canViewRoles ? [{ label: 'Manage users & roles', href: '/dashboard/users' }] : []),
    ...(state.canViewSettings ? [{ label: 'Open site settings', href: '/dashboard/settings' }] : []),
  ]
}

export function buildDashboardOverviewData(
  snapshot: DashboardOverviewSnapshot,
  permissions: string[],
  roleName: string,
): DashboardOverviewData {
  const state = getDashboardPermissionState(permissions, roleName)
  const { counts } = snapshot

  const statCards: DashboardStatCard[] = [
    ...(state.canViewProperties ? [{ value: counts.properties, label: 'Total properties', link: '/dashboard/properties' }] : []),
    ...(state.canViewBlog ? [{ value: counts.blogPosts, label: 'Published posts', link: '/dashboard/blog' }] : []),
    ...(state.canViewNews ? [{ value: counts.newsArticles, label: 'Published news', link: '/dashboard/news' }] : []),
    ...(state.canViewSubmissions ? [{ value: counts.unreadMessages, label: 'Unread messages', link: '/dashboard/contact-messages' }] : []),
    ...(state.canViewSubmissions ? [{ value: counts.newShowings, label: 'New showing requests', link: '/dashboard/showings' }] : []),
    ...(state.canViewUsers ? [{ value: counts.users, label: 'Active users', link: '/dashboard/users' }] : []),
  ]

  const totalDrafts = counts.draftProperties + counts.draftBlogPosts + counts.draftNewsArticles
  const unreadSubmissions = counts.unreadMessages + counts.newShowings
  const pendingFollowUps = counts.readMessages + counts.confirmedShowings

  const draftBreakdown = [
    counts.draftProperties > 0 ? `${counts.draftProperties} property drafts` : '',
    counts.draftBlogPosts > 0 ? `${counts.draftBlogPosts} blog drafts` : '',
    counts.draftNewsArticles > 0 ? `${counts.draftNewsArticles} news drafts` : '',
  ].filter(Boolean)

  const taskCards: DashboardTaskCard[] = [
    ...(state.canViewSubmissions
      ? [{
          value: unreadSubmissions,
          label: 'Unread submissions',
          hint: `${counts.newShowings} new showings · ${counts.unreadMessages} unread messages`,
          href: counts.newShowings > 0 ? '/dashboard/showings' : '/dashboard/contact-messages',
        }]
      : []),
    ...((state.canViewProperties || state.canViewBlog || state.canViewNews)
      ? [{
          value: totalDrafts,
          label: 'Drafts',
          hint: draftBreakdown.join(' · ') || 'No drafts waiting right now',
          href: state.canViewProperties ? '/dashboard/properties' : state.canViewBlog ? '/dashboard/blog' : '/dashboard/news',
        }]
      : []),
    ...(state.canViewProperties
      ? [{
          value: counts.expiringListings,
          label: 'Expiring listings',
          hint: 'Published listings expiring within the next 30 days',
          href: '/dashboard/properties',
        }]
      : []),
    ...(state.canViewSubmissions
      ? [{
          value: pendingFollowUps,
          label: 'Pending follow-ups',
          hint: `${counts.confirmedShowings} confirmed showings · ${counts.readMessages} read messages`,
          href: counts.confirmedShowings > 0 ? '/dashboard/showings' : '/dashboard/contact-messages',
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

  const activityItems: DashboardActivityItem[] = state.canViewSubmissions
    ? [
        ...snapshot.recentShowings.map((showing) => ({
          id: `showing-${showing.id}`,
          createdAt: showing.createdAt,
          message: `${showing.type === 'showing' ? 'a showing request' : 'an agent enquiry'} from ${showing.name}${showing.propertyTitle ? ` for ${showing.propertyTitle}` : ''}`,
        })),
        ...snapshot.recentMessages.map((message) => ({
          id: `message-${message.id}`,
          createdAt: message.createdAt,
          message: `a contact message from ${message.name}`,
        })),
      ]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 6)
    : []

  return {
    statCards,
    taskCards,
    adminSummaryCards,
    activityItems,
    generatedAt: snapshot.generatedAt,
  }
}
