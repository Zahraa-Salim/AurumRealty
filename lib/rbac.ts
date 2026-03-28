export type PermissionDefinition = {
  key: string
  label: string
  description: string
  group: string
}

export type RoleTemplate = {
  name: string
  description: string
  isSystem: boolean
  permissionKeys: string[]
}

export type DashboardNavItem = {
  section: string
  to: string
  label: string
  anyPermissions?: string[]
}

export const RBAC_PERMISSIONS: PermissionDefinition[] = [
  { key: 'dashboard.view', label: 'View dashboard', description: 'Open the dashboard overview.', group: 'General' },
  { key: 'properties.view', label: 'View properties', description: 'View property listings inside the dashboard.', group: 'Properties' },
  { key: 'properties.create', label: 'Create properties', description: 'Add new properties.', group: 'Properties' },
  { key: 'properties.edit', label: 'Edit properties', description: 'Edit existing properties.', group: 'Properties' },
  { key: 'properties.delete', label: 'Delete properties', description: 'Delete properties.', group: 'Properties' },
  { key: 'blog.view', label: 'View blog posts', description: 'View blog content in the dashboard.', group: 'Blog' },
  { key: 'blog.create', label: 'Create blog posts', description: 'Create blog posts.', group: 'Blog' },
  { key: 'blog.edit', label: 'Edit blog posts', description: 'Edit blog posts.', group: 'Blog' },
  { key: 'blog.delete', label: 'Delete blog posts', description: 'Delete blog posts.', group: 'Blog' },
  { key: 'news.view', label: 'View news articles', description: 'View news content in the dashboard.', group: 'News' },
  { key: 'news.create', label: 'Create news articles', description: 'Create news articles.', group: 'News' },
  { key: 'news.edit', label: 'Edit news articles', description: 'Edit news articles.', group: 'News' },
  { key: 'news.delete', label: 'Delete news articles', description: 'Delete news articles.', group: 'News' },
  { key: 'pages.edit', label: 'Edit static pages', description: 'Manage dashboard pages such as Home, About, and Services.', group: 'Pages' },
  { key: 'submissions.view', label: 'View all submissions', description: 'View all showings and contact messages (admin access).', group: 'Submissions' },
  { key: 'submissions.view.own', label: 'View own submissions', description: 'View only showings and messages assigned to this user.', group: 'Submissions' },
  { key: 'submissions.update', label: 'Update submissions', description: 'Change submission statuses.', group: 'Submissions' },
  { key: 'submissions.delete', label: 'Delete submissions', description: 'Delete submissions.', group: 'Submissions' },
  { key: 'users.view', label: 'View users', description: 'View dashboard users.', group: 'Users' },
  { key: 'users.create', label: 'Create users', description: 'Create dashboard users.', group: 'Users' },
  { key: 'users.edit', label: 'Edit users', description: 'Change user roles and access state.', group: 'Users' },
  { key: 'roles.view', label: 'View roles', description: 'View dynamic roles and their permissions.', group: 'Roles' },
  { key: 'roles.create', label: 'Create roles', description: 'Create custom roles.', group: 'Roles' },
  { key: 'roles.edit', label: 'Edit roles', description: 'Edit custom roles.', group: 'Roles' },
  { key: 'roles.delete', label: 'Delete roles', description: 'Delete custom roles.', group: 'Roles' },
  { key: 'settings.view', label: 'View settings', description: 'View site settings.', group: 'Settings' },
  { key: 'settings.edit', label: 'Edit settings', description: 'Change site settings and shared content.', group: 'Settings' },
]

export const SYSTEM_ROLE_TEMPLATES: RoleTemplate[] = [
  {
    name: 'Super Admin',
    description: 'Full access to all dashboard areas, roles, users, and settings.',
    isSystem: true,
    permissionKeys: RBAC_PERMISSIONS.map(permission => permission.key),
  },
  {
    name: 'Editor',
    description: 'Can create and edit blog posts and news articles.',
    isSystem: true,
    permissionKeys: [
      'dashboard.view',
      'blog.view',
      'blog.create',
      'blog.edit',
      'news.view',
      'news.create',
      'news.edit',
    ],
  },
  {
    name: 'Property Manager',
    description: 'Can manage property listings and respond to showing submissions assigned to them.',
    isSystem: true,
    permissionKeys: [
      'dashboard.view',
      'properties.view',
      'properties.create',
      'properties.edit',
      'submissions.view.own',
      'submissions.update',
    ],
  },
  {
    name: 'Support',
    description: 'Can review and update all contact and showing submissions.',
    isSystem: true,
    permissionKeys: [
      'dashboard.view',
      'submissions.view',
      'submissions.update',
    ],
  },
]

export const DASHBOARD_NAV_ITEMS: DashboardNavItem[] = [
  { section: 'Overview', to: '/dashboard', label: 'Dashboard home', anyPermissions: ['dashboard.view'] },
  { section: 'Content', to: '/dashboard/properties', label: 'Properties', anyPermissions: ['properties.view'] },
  { section: 'Content', to: '/dashboard/blog', label: 'Blog', anyPermissions: ['blog.view'] },
  { section: 'Content', to: '/dashboard/news', label: 'News', anyPermissions: ['news.view'] },
  { section: 'Content', to: '/dashboard/services', label: 'Services', anyPermissions: ['pages.edit'] },
  { section: 'Content', to: '/dashboard/about', label: 'About', anyPermissions: ['pages.edit'] },
  { section: 'Content', to: '/dashboard/home', label: 'Home page', anyPermissions: ['pages.edit'] },
  { section: 'Submissions', to: '/dashboard/showings', label: 'Showing requests', anyPermissions: ['submissions.view', 'submissions.view.own'] },
  { section: 'Submissions', to: '/dashboard/contact-messages', label: 'Contact messages', anyPermissions: ['submissions.view', 'submissions.view.own'] },
  { section: 'Settings', to: '/dashboard/users', label: 'Users & roles', anyPermissions: ['users.view', 'roles.view'] },
  { section: 'Settings', to: '/dashboard/settings', label: 'Site settings', anyPermissions: ['settings.view'] },
]

const DASHBOARD_ROUTE_REQUIREMENTS: Array<{ prefix: string; anyPermissions: string[] }> = [
  { prefix: '/dashboard/properties/new', anyPermissions: ['properties.create'] },
  { prefix: '/dashboard/properties/edit', anyPermissions: ['properties.edit'] },
  { prefix: '/dashboard/properties', anyPermissions: ['properties.view'] },
  { prefix: '/dashboard/blog/new', anyPermissions: ['blog.create'] },
  { prefix: '/dashboard/blog/edit', anyPermissions: ['blog.edit'] },
  { prefix: '/dashboard/blog', anyPermissions: ['blog.view'] },
  { prefix: '/dashboard/news/new', anyPermissions: ['news.create'] },
  { prefix: '/dashboard/news/edit', anyPermissions: ['news.edit'] },
  { prefix: '/dashboard/news', anyPermissions: ['news.view'] },
  { prefix: '/dashboard/services', anyPermissions: ['pages.edit'] },
  { prefix: '/dashboard/about', anyPermissions: ['pages.edit'] },
  { prefix: '/dashboard/home', anyPermissions: ['pages.edit'] },
  { prefix: '/dashboard/showings', anyPermissions: ['submissions.view', 'submissions.view.own'] },
  { prefix: '/dashboard/contact-messages', anyPermissions: ['submissions.view', 'submissions.view.own'] },
  { prefix: '/dashboard/users', anyPermissions: ['users.view', 'roles.view'] },
  { prefix: '/dashboard/settings', anyPermissions: ['settings.view'] },
  { prefix: '/dashboard/profile', anyPermissions: [] },
  { prefix: '/dashboard', anyPermissions: ['dashboard.view'] },
]

export const PERMISSION_GROUPS = Array.from(new Set(RBAC_PERMISSIONS.map(permission => permission.group)))

export const PERMISSIONS_BY_GROUP = PERMISSION_GROUPS.map(group => ({
  group,
  permissions: RBAC_PERMISSIONS.filter(permission => permission.group === group),
}))

export function hasPermission(permissions: string[], permission: string) {
  return permissions.includes(permission)
}

export function hasAnyPermission(permissions: string[], required: string[]) {
  if (required.length === 0) return true
  return required.some(permission => hasPermission(permissions, permission))
}

export function getRequiredPermissionsForDashboardPath(pathname: string) {
  const match = DASHBOARD_ROUTE_REQUIREMENTS.find(rule => pathname === rule.prefix || pathname.startsWith(`${rule.prefix}/`))
  return match?.anyPermissions ?? null
}
