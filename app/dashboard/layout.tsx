/**
 * Dashboard Root Layout — /dashboard/*
 *
 * Wraps every dashboard page with DashboardSidebar + DashboardTopBar.
 * No public Navigation or Footer appear here.
 * Projects removed. Added: /dashboard/showings, /dashboard/profile.
 */

'use client'

import React, { useState } from 'react'
import { usePathname } from 'next/navigation'
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar'
import { DashboardTopBar } from '@/components/dashboard/DashboardTopBar'

function getPageInfo(pathname: string) {
  const p = pathname.replace('/dashboard', '')
  if (p === '' || p === '/')              return { title: 'Dashboard',         breadcrumbs: ['Overview'] }
  if (p.startsWith('/properties/new'))     return { title: 'Add property',      breadcrumbs: ['Content', 'Properties', 'New'] }
  if (p.startsWith('/properties/edit'))    return { title: 'Edit property',     breadcrumbs: ['Content', 'Properties', 'Edit'] }
  if (p.match(/^\/properties\/\d+/))      return { title: 'Property detail',   breadcrumbs: ['Content', 'Properties', 'Detail'] }
  if (p.startsWith('/properties'))        return { title: 'Properties',        breadcrumbs: ['Content', 'Properties'] }
  if (p.startsWith('/blog/new'))           return { title: 'New blog post',     breadcrumbs: ['Content', 'Blog', 'New'] }
  if (p.startsWith('/blog/edit'))          return { title: 'Edit blog post',    breadcrumbs: ['Content', 'Blog', 'Edit'] }
  if (p.match(/^\/blog\/\d+/))            return { title: 'Blog post',         breadcrumbs: ['Content', 'Blog', 'Detail'] }
  if (p.startsWith('/blog'))              return { title: 'Blog posts',        breadcrumbs: ['Content', 'Blog'] }
  if (p.startsWith('/news/new'))           return { title: 'New news article',  breadcrumbs: ['Content', 'News', 'New'] }
  if (p.startsWith('/news/edit'))          return { title: 'Edit news article', breadcrumbs: ['Content', 'News', 'Edit'] }
  if (p.match(/^\/news\/\d+/))            return { title: 'News article',      breadcrumbs: ['Content', 'News', 'Detail'] }
  if (p.startsWith('/news'))              return { title: 'News',              breadcrumbs: ['Content', 'News'] }
  if (p.startsWith('/services'))          return { title: 'Services',          breadcrumbs: ['Content', 'Services'] }
  if (p.startsWith('/about'))             return { title: 'About page',        breadcrumbs: ['Content', 'About'] }
  if (p.startsWith('/home'))              return { title: 'Home page',         breadcrumbs: ['Content', 'Home page'] }
  if (p.startsWith('/showings'))          return { title: 'Showing requests',  breadcrumbs: ['Submissions', 'Showings'] }
  if (p.startsWith('/contact-messages'))  return { title: 'Contact messages',  breadcrumbs: ['Submissions', 'Contact messages'] }
  if (p.startsWith('/users'))             return { title: 'Users & roles',     breadcrumbs: ['Settings', 'Users & roles'] }
  if (p.startsWith('/settings'))          return { title: 'Site settings',     breadcrumbs: ['Settings', 'Site settings'] }
  if (p.startsWith('/profile'))           return { title: 'My profile',        breadcrumbs: ['Profile'] }
  return { title: 'Dashboard', breadcrumbs: ['Overview'] }
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()
  const { title, breadcrumbs } = getPageInfo(pathname)

  return (
    <div className="min-h-screen bg-[#F7F6F3] flex">
      <DashboardSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col lg:ml-[240px] min-w-0">
        <DashboardTopBar
          title={title}
          breadcrumbs={breadcrumbs}
          onMenuClick={() => setSidebarOpen(true)}
        />
        <main className="flex-1 p-6 md:p-8 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  )
}
