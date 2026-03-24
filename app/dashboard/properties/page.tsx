'use client'

import React, { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { StatusBadge, ConfirmModal } from '@/components/dashboard/DashboardShared'
import { DashboardAccessDenied } from '@/components/dashboard/DashboardAccessDenied'
import { hasAnyPermission } from '@/lib/rbac'

type Property = {
  id: number; title: string; type: string; status: string
  price: string; neighbourhood: string; images: string[]
  isPublished: boolean
}

const statusVariant = (s: string): 'gold' | 'green' | 'cream' | 'gray' => {
  if (s === 'For Sale')        return 'gold'
  if (s === 'New Development') return 'green'
  if (s === 'For Rent')        return 'cream'
  return 'gray'
}

const PAGE_SIZE = 6

export default function DashboardPropertiesListPage() {
  const { data: session, status } = useSession()
  const [items,        setItems]        = useState<Property[]>([])
  const [loading,      setLoading]      = useState(true)
  const [error,        setError]        = useState(false)
  const [search,       setSearch]       = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [typeFilter,   setTypeFilter]   = useState('')
  const [page,         setPage]         = useState(1)
  const [deleteId,     setDeleteId]     = useState<number | null>(null)
  const [deleting,     setDeleting]     = useState(false)

  const canView = hasAnyPermission(session?.user?.permissions ?? [], ['properties.view'])

  useEffect(() => {
    if (status !== 'authenticated' || !canView) {
      return
    }

    fetch('/api/properties?all=true')
      .then(r => r.json())
      .then(d => { setItems(d); setLoading(false) })
      .catch(() => { setError(true); setLoading(false) })
  }, [canView, status])

  const filtered = useMemo(() => items.filter((p) => {
    const q = search.toLowerCase()
    if (q && !p.title.toLowerCase().includes(q) && !p.neighbourhood.toLowerCase().includes(q)) return false
    if (statusFilter && p.status !== statusFilter) return false
    if (typeFilter   && p.type   !== typeFilter)   return false
    return true
  }), [items, search, statusFilter, typeFilter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const handleDelete = async () => {
    if (!deleteId) return
    setDeleting(true)
    try {
      await fetch(`/api/properties/${deleteId}`, { method: 'DELETE' })
      setItems(prev => prev.filter(p => p.id !== deleteId))
    } catch { /* table stays as-is on error */ }
    setDeleting(false)
    setDeleteId(null)
  }

  const inputCls = 'h-[40px] px-4 font-sans text-[13px] text-charcoal bg-white border border-light-gray rounded-sm focus:outline-none focus:border-charcoal'

  if (status === 'loading') {
    return (
      <div className="max-w-4xl mx-auto pt-12 text-center">
        <p className="font-sans text-[14px] text-taupe">Loading properties…</p>
      </div>
    )
  }

  if (!canView) {
    return <DashboardAccessDenied message="You do not have permission to view properties." />
  }

  return (
    <div className="max-w-7xl mx-auto space-y-5">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <input type="text" placeholder="Search properties…" value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            className={`${inputCls} w-full sm:w-[240px]`} style={{ borderWidth: '0.5px' }} />
          <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}
            className={`${inputCls} w-full sm:w-[150px]`} style={{ borderWidth: '0.5px' }}>
            <option value="">All statuses</option>
            <option>For Sale</option><option>For Rent</option><option>New Development</option>
          </select>
          <select value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value); setPage(1) }}
            className={`${inputCls} w-full sm:w-[140px]`} style={{ borderWidth: '0.5px' }}>
            <option value="">All types</option>
            <option>Estate</option><option>Villa</option><option>Penthouse</option>
            <option>Townhouse</option><option>Apartment</option>
          </select>
        </div>
        <Link href="/dashboard/properties/new"
          className="bg-gold hover:bg-gold-dark text-charcoal font-sans text-[13px] font-medium px-6 py-2.5 rounded-full transition-colors no-underline whitespace-nowrap">
          Add property
        </Link>
      </div>

      <div className="bg-white border border-light-gray rounded-sm overflow-x-auto" style={{ borderWidth: '0.5px' }}>
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="border-b border-light-gray bg-light-gray/10" style={{ borderWidth: '0 0 0.5px 0' }}>
              <th className="p-4 w-[72px] font-sans text-[12px] font-medium uppercase tracking-wider text-taupe">Image</th>
              <th className="p-4 font-sans text-[12px] font-medium uppercase tracking-wider text-taupe">Title</th>
              <th className="p-4 font-sans text-[12px] font-medium uppercase tracking-wider text-taupe">Type</th>
              <th className="p-4 font-sans text-[12px] font-medium uppercase tracking-wider text-taupe">Status</th>
              <th className="p-4 font-sans text-[12px] font-medium uppercase tracking-wider text-taupe">Price</th>
              <th className="p-4 font-sans text-[12px] font-medium uppercase tracking-wider text-taupe">Location</th>
              <th className="p-4 font-sans text-[12px] font-medium uppercase tracking-wider text-taupe">Published</th>
              <th className="p-4 font-sans text-[12px] font-medium uppercase tracking-wider text-taupe text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <tr key={i} className="border-b border-light-gray" style={{ borderWidth: '0 0 0.5px 0' }}>
                  {Array.from({ length: 8 }).map((_, j) => (
                    <td key={j} className="p-4"><div className="h-4 bg-light-gray/60 rounded animate-pulse" /></td>
                  ))}
                </tr>
              ))
            ) : error ? (
              <tr><td colSpan={8} className="p-16 text-center">
                <p className="font-serif text-[20px] text-charcoal mb-2">Failed to load properties</p>
                <p className="font-sans text-[14px] text-taupe">Check your database connection and try again.</p>
              </td></tr>
            ) : paginated.length === 0 ? (
              <tr><td colSpan={8} className="p-16 text-center">
                <p className="font-serif text-[20px] text-charcoal mb-2">No properties found</p>
                <p className="font-sans text-[14px] text-taupe">Try adjusting your search or filters.</p>
              </td></tr>
            ) : paginated.map((p, i) => (
              <tr key={p.id}
                className="border-b border-light-gray last:border-0 hover:bg-light-gray/5 transition-colors"
                style={{ borderWidth: i === paginated.length - 1 ? '0' : '0 0 0.5px 0' }}>
                <td className="p-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.images[0] ?? 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=100&q=80'}
                    alt={p.title} className="w-12 h-12 object-cover rounded-sm" />
                </td>
                <td className="p-4">
                  <Link href={`/dashboard/properties/${p.id}`}
                    className="font-sans text-[14px] text-charcoal font-medium hover:text-gold no-underline transition-colors">
                    {p.title}
                  </Link>
                </td>
                <td className="p-4 font-sans text-[14px] text-taupe">{p.type}</td>
                <td className="p-4"><StatusBadge status={p.status} variant={statusVariant(p.status)} /></td>
                <td className="p-4 font-sans text-[14px] text-gold font-medium">{p.price}</td>
                <td className="p-4 font-sans text-[14px] text-taupe">{p.neighbourhood}</td>
                <td className="p-4">
                  <span className={`font-sans text-[12px] font-medium px-2 py-0.5 rounded-sm ${p.isPublished ? 'bg-success/10 text-success' : 'bg-light-gray text-taupe'}`}>
                    {p.isPublished ? 'Live' : 'Draft'}
                  </span>
                </td>
                <td className="p-4 text-right space-x-4">
                  <Link href={`/dashboard/properties/edit/${p.id}`}
                    className="font-sans text-[13px] text-charcoal hover:text-taupe no-underline">Edit</Link>
                  <button onClick={() => setDeleteId(p.id)}
                    className="font-sans text-[13px] text-error hover:text-error/70 bg-transparent border-none cursor-pointer p-0">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {!loading && !error && totalPages > 1 && (
        <div className="flex justify-between items-center pt-2">
          <span className="font-sans text-[13px] text-taupe">
            {filtered.length} {filtered.length === 1 ? 'property' : 'properties'}
          </span>
          <div className="flex gap-2">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="px-4 py-2 font-sans text-[13px] text-charcoal bg-white border border-light-gray rounded-sm hover:bg-light-gray/20 disabled:opacity-40 cursor-pointer"
              style={{ borderWidth: '0.5px' }}>Previous</button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
              <button key={n} onClick={() => setPage(n)}
                className={`w-9 h-9 font-sans text-[13px] rounded-sm border cursor-pointer ${n === page ? 'bg-charcoal text-white border-charcoal' : 'bg-white border-light-gray text-charcoal hover:bg-light-gray/20'}`}
                style={{ borderWidth: '0.5px' }}>{n}</button>
            ))}
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="px-4 py-2 font-sans text-[13px] text-charcoal bg-white border border-light-gray rounded-sm hover:bg-light-gray/20 disabled:opacity-40 cursor-pointer"
              style={{ borderWidth: '0.5px' }}>Next</button>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete property"
        message="This will permanently remove the property and all its showing requests. This action cannot be undone."
        confirmLabel={deleting ? 'Deleting…' : 'Delete'}
        variant="danger"
      />
    </div>
  )
}
