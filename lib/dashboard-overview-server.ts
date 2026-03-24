import 'server-only'

import { unstable_cache } from 'next/cache'
import { prisma } from '@/lib/prisma'
import type { DashboardOverviewSnapshot } from '@/lib/dashboard-overview'

function getAllCount(value: unknown) {
  if (typeof value === 'object' && value !== null && '_all' in value) {
    return Number((value as { _all?: number })._all ?? 0)
  }

  return 0
}

const getCachedDashboardOverviewSnapshotInternal = unstable_cache(
  async (): Promise<DashboardOverviewSnapshot> => {
    const now = new Date()
    const thirtyDaysFromNow = new Date(now)
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)

    const [
      properties,
      draftProperties,
      expiringListings,
      blogPublished,
      blogDrafts,
      newsPublished,
      newsDrafts,
      messageStatusGroups,
      showingStatusGroups,
      userActiveGroups,
      roleSystemGroups,
      recentShowings,
      recentMessages,
    ] = await prisma.$transaction([
      prisma.property.count(),
      prisma.property.count({ where: { isPublished: false } }),
      prisma.property.count({
        where: {
          isPublished: true,
          listingExpiresAt: {
            gte: now,
            lte: thirtyDaysFromNow,
          },
        },
      }),
      prisma.blogPost.count({ where: { isPublished: true } }),
      prisma.blogPost.count({ where: { isPublished: false } }),
      prisma.newsArticle.count({ where: { isPublished: true } }),
      prisma.newsArticle.count({ where: { isPublished: false } }),
      prisma.contactMessage.groupBy({
        by: ['status'],
        orderBy: { status: 'asc' },
        _count: { _all: true },
      }),
      prisma.showing.groupBy({
        by: ['status'],
        orderBy: { status: 'asc' },
        _count: { _all: true },
      }),
      prisma.user.groupBy({
        by: ['isActive'],
        orderBy: { isActive: 'asc' },
        _count: { _all: true },
      }),
      prisma.role.groupBy({
        by: ['isSystem'],
        orderBy: { isSystem: 'asc' },
        _count: { _all: true },
      }),
      prisma.showing.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          type: true,
          name: true,
          createdAt: true,
          property: {
            select: {
              title: true,
            },
          },
        },
      }),
      prisma.contactMessage.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          name: true,
          createdAt: true,
        },
      }),
    ])

    const unreadMessages = getAllCount(messageStatusGroups.find((group) => group.status === 'Unread')?._count)
    const readMessages = getAllCount(messageStatusGroups.find((group) => group.status === 'Read')?._count)
    const newShowings = getAllCount(showingStatusGroups.find((group) => group.status === 'New')?._count)
    const confirmedShowings = getAllCount(showingStatusGroups.find((group) => group.status === 'Confirmed')?._count)
    const users = getAllCount(userActiveGroups.find((group) => group.isActive === true)?._count)
    const inactiveUsers = getAllCount(userActiveGroups.find((group) => group.isActive === false)?._count)
    const systemRoles = getAllCount(roleSystemGroups.find((group) => group.isSystem === true)?._count)
    const customRoles = getAllCount(roleSystemGroups.find((group) => group.isSystem === false)?._count)

    return {
      counts: {
        properties,
        blogPosts: blogPublished,
        newsArticles: newsPublished,
        unreadMessages,
        newShowings,
        users,
        draftProperties,
        draftBlogPosts: blogDrafts,
        draftNewsArticles: newsDrafts,
        expiringListings,
        readMessages,
        confirmedShowings,
        totalRoles: systemRoles + customRoles,
        customRoles,
        inactiveUsers,
        systemRoles,
      },
      recentShowings: recentShowings.map((showing) => ({
        id: showing.id,
        type: showing.type,
        name: showing.name,
        createdAt: showing.createdAt.toISOString(),
        propertyTitle: showing.property?.title ?? null,
      })),
      recentMessages: recentMessages.map((message) => ({
        id: message.id,
        name: message.name,
        createdAt: message.createdAt.toISOString(),
      })),
      generatedAt: new Date().toISOString(),
    }
  },
  ['dashboard-overview-snapshot'],
  { revalidate: 30 },
)

export async function getCachedDashboardOverviewSnapshot() {
  return getCachedDashboardOverviewSnapshotInternal()
}
