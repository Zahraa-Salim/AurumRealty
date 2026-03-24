'use client'

import React, { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { StatusBadge, ConfirmModal } from '@/components/dashboard/DashboardShared'
import { DashboardAccessDenied } from '@/components/dashboard/DashboardAccessDenied'
import { hasAnyPermission } from '@/lib/rbac'

type Article = {
  id: number; title: string; slug: string; category: string
  author: string; publishedAt: string | null; isPublished: boolean
}

export default function DashboardNewsListPage() {
  const { data: session, status } = useSession()
  const [articles, setArticles] = useState<Article[]>([])
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState(false)
  const [search,   setSearch]   = useState('')
  const [category, setCategory] = useState('')
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [deleting, setDeleting] = useState(false)

  const canView = hasAnyPermission(session?.user?.permissions ?? [], ['news.view'])

  useEffect(() => {
    if (status !== 'authenticated' || !canView) {
      return
    }

    fetch('/api/news?all=true')
      .then(r => r.json())
      .then(d => { setArticles(d); setLoading(false) })
      .catch(() => { setError(true); setLoading(false) })
  }, [canView, status])

  const filtered = useMemo(() => articles.filter((a) => {
    if (category && a.category !== category) return false
    if (search   && !a.title.toLowerCase().includes(search.toLowerCase())) return false
    return true
  }), [articles, search, category])

  const handleDelete = async () => {
    if (!deleteId) return
    setDeleting(true)
    try {
      await fetch(`/api/news/${deleteId}`, { method: 'DELETE' })
      setArticles(prev => prev.filter(a => a.id !== deleteId))
    } catch { /* keep table as-is */ }
    setDeleting(false)
    setDeleteId(null)
  }

  const formatDate = (d: string | null) =>
    d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'

  const inputCls = 'h-[40px] px-4 font-sans text-[13px] text-charcoal bg-white border border-light-gray rounded-sm focus:outline-none focus:border-charcoal'

  if (status === 'loading') {
    return (
      <div className="max-w-4xl mx-auto pt-12 text-center">
        <p className="font-sans text-[14px] text-taupe">Loading news articles…</p>
      </div>
    )
  }

  if (!canView) {
    return <DashboardAccessDenied message="You do not have permission to view news articles." />
  }

  return (
    <div className="max-w-7xl mx-auto space-y-5">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <input type="text" placeholder="Search news…" value={search}
            onChange={e => setSearch(e.target.value)}
            className={`${inputCls} w-full sm:w-[240px]`} style={{ borderWidth: '0.5px' }} />
          <select value={category} onChange={e => setCategory(e.target.value)}
            className={`${inputCls} w-full sm:w-[200px]`} style={{ borderWidth: '0.5px' }}>
            <option value="">All categories</option>
            <option>Company news</option>
            <option>Market update</option>
            <option>Awards</option>
            <option>Industry insight</option>
            <option>Transaction</option>
          </select>
        </div>
        <Link href="/dashboard/news/new"
          className="bg-gold hover:bg-gold-dark text-charcoal font-sans text-[13px] font-medium px-6 py-2.5 rounded-full transition-colors no-underline whitespace-nowrap">
          New article
        </Link>
      </div>

      <div className="bg-white border border-light-gray rounded-sm overflow-x-auto" style={{ borderWidth: '0.5px' }}>
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="border-b border-light-gray bg-light-gray/10" style={{ borderWidth: '0 0 0.5px 0' }}>
              {['Title', 'Category', 'Author', 'Published', 'Status', 'Actions'].map(h => (
                <th key={h} className={`p-4 font-sans text-[12px] font-medium uppercase tracking-wider text-taupe ${h === 'Actions' ? 'text-right' : ''}`}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <tr key={i} className="border-b border-light-gray" style={{ borderWidth: '0 0 0.5px 0' }}>
                  {Array.from({ length: 6 }).map((_, j) => (
                    <td key={j} className="p-4"><div className="h-4 bg-light-gray/60 rounded animate-pulse" /></td>
                  ))}
                </tr>
              ))
            ) : error ? (
              <tr><td colSpan={6} className="p-16 text-center">
                <p className="font-serif text-[20px] text-charcoal mb-2">Failed to load articles</p>
                <p className="font-sans text-[14px] text-taupe">Check your database connection and try again.</p>
              </td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={6} className="p-16 text-center">
                <p className="font-serif text-[20px] text-charcoal mb-2">No articles found</p>
                <p className="font-sans text-[14px] text-taupe">Try adjusting your search or category filter.</p>
              </td></tr>
            ) : filtered.map((a, i) => (
              <tr key={a.id}
                className="border-b border-light-gray last:border-0 hover:bg-light-gray/5 transition-colors"
                style={{ borderWidth: i === filtered.length - 1 ? '0' : '0 0 0.5px 0' }}>
                <td className="p-4 max-w-[300px]">
                  <Link href={`/dashboard/news/${a.id}`}
                    className="font-sans text-[14px] text-charcoal font-medium hover:text-gold no-underline transition-colors block truncate">
                    {a.title}
                  </Link>
                </td>
                <td className="p-4">
                  <span className="px-2.5 py-1 bg-light-gray/40 text-charcoal font-sans text-[12px] rounded-sm">{a.category}</span>
                </td>
                <td className="p-4 font-sans text-[14px] text-taupe">{a.author}</td>
                <td className="p-4 font-sans text-[14px] text-taupe">{formatDate(a.publishedAt)}</td>
                <td className="p-4">
                  <StatusBadge status={a.isPublished ? 'Published' : 'Draft'} variant={a.isPublished ? 'gold' : 'gray'} />
                </td>
                <td className="p-4 text-right space-x-4">
                  <Link href={`/dashboard/news/edit/${a.id}`}
                    className="font-sans text-[13px] text-charcoal hover:text-taupe no-underline">Edit</Link>
                  <button onClick={() => setDeleteId(a.id)}
                    className="font-sans text-[13px] text-error hover:text-error/70 bg-transparent border-none cursor-pointer p-0">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ConfirmModal
        isOpen={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete article"
        message="This will permanently remove the news article. This action cannot be undone."
        confirmLabel={deleting ? 'Deleting…' : 'Delete'}
        variant="danger"
      />
    </div>
  )
}
