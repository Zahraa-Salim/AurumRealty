'use client'

import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { DashboardAccessDenied } from '@/components/dashboard/DashboardAccessDenied'
import { StatusBadge, ConfirmModal } from '@/components/dashboard/DashboardShared'
import { hasAnyPermission } from '@/lib/rbac'

type Showing = {
  id: number
  type: string
  name: string
  email: string
  phone: string | null
  propertyName: string
  date: string | null
  time: string | null
  message: string
  status: string
  createdAt: string
}

type Tab = 'showings' | 'enquiries'

const statusVariant = (s: string): 'green' | 'gold' | 'gray' | 'red' => {
  if (s === 'New')                          return 'green'
  if (s === 'Confirmed' || s === 'Replied') return 'gold'
  if (s === 'Cancelled')                    return 'red'
  return 'gray'
}

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })

const nextStatuses = (status: string, type: string): string[] => {
  if (type === 'showing') {
    if (status === 'New')       return ['Confirmed', 'Cancelled']
    if (status === 'Confirmed') return ['Completed', 'Cancelled']
  } else {
    if (status === 'New') return ['Replied']
  }
  return []
}

export default function DashboardShowingsPage() {
  const { data: session, status } = useSession()
  const [all,        setAll]        = useState<Showing[]>([])
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState(false)
  const [tab,        setTab]        = useState<Tab>('showings')
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [deleteId,   setDeleteId]   = useState<number | null>(null)
  const [updating,   setUpdating]   = useState(false)
  const [deleting,   setDeleting]   = useState(false)

  const canView = hasAnyPermission(session?.user?.permissions ?? [], ['submissions.view'])

  useEffect(() => {
    if (status !== 'authenticated' || !canView) {
      return
    }

    fetch('/api/showings')
      .then(r => r.json())
      .then(d => { setAll(d); setLoading(false) })
      .catch(() => { setError(true); setLoading(false) })
  }, [canView, status])

  const showings  = all.filter(s => s.type === 'showing')
  const enquiries = all.filter(s => s.type === 'agent_enquiry')
  const data      = tab === 'showings' ? showings : enquiries
  const active    = all.find(s => s.id === selectedId)
  const newCount  = (arr: Showing[]) => arr.filter(s => s.status === 'New').length

  const updateStatus = async (id: number, status: string) => {
    setUpdating(true)
    try {
      const res = await fetch(`/api/showings/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (res.ok) {
        const updated = await res.json()
        setAll(prev => prev.map(s => s.id === id ? { ...s, status: updated.status } : s))
      }
    } catch { /* silent */ }
    setUpdating(false)
  }

  const handleDelete = async () => {
    if (!deleteId) return
    setDeleting(true)
    try {
      await fetch(`/api/showings/${deleteId}`, { method: 'DELETE' })
      setAll(prev => prev.filter(s => s.id !== deleteId))
      setSelectedId(null)
    } catch { /* silent */ }
    setDeleting(false)
    setDeleteId(null)
  }

  if (status === 'loading') {
    return (
      <div className="max-w-4xl mx-auto pt-12 text-center">
        <p className="font-sans text-[14px] text-taupe">Loading submissions…</p>
      </div>
    )
  }

  if (!canView) {
    return <DashboardAccessDenied message="You do not have permission to view submissions." />
  }

  return (
    <div className="max-w-7xl mx-auto space-y-5 relative">

      {/* Tabs */}
      <div className="flex border-b border-light-gray" style={{ borderWidth: '0 0 0.5px 0' }}>
        {(['showings', 'enquiries'] as Tab[]).map(key => {
          const label = key === 'showings' ? 'Showing requests' : 'Agent enquiries'
          const count = newCount(key === 'showings' ? showings : enquiries)
          return (
            <button key={key} onClick={() => { setTab(key); setSelectedId(null) }}
              className={`relative h-[44px] px-6 font-sans text-[14px] bg-transparent border-none cursor-pointer transition-colors ${tab === key ? 'text-charcoal font-medium' : 'text-taupe hover:text-charcoal'}`}>
              {label}
              {count > 0 && (
                <span className="ml-2 inline-flex items-center justify-center w-[18px] h-[18px] bg-gold text-charcoal font-sans text-[10px] font-medium rounded-full">{count}</span>
              )}
              {tab === key && <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-charcoal" />}
            </button>
          )
        })}
        <div className="ml-auto flex items-center pb-1">
          <button className="px-5 py-2 rounded-full font-sans text-[13px] font-medium text-charcoal bg-transparent border border-charcoal hover:bg-light-gray/20 transition-colors" style={{ borderWidth: '0.5px' }}>
            Export CSV
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-light-gray rounded-sm overflow-x-auto" style={{ borderWidth: '0.5px' }}>
        <table className="w-full text-left border-collapse min-w-[900px]">
          <thead>
            <tr className="border-b border-light-gray bg-light-gray/10" style={{ borderWidth: '0 0 0.5px 0' }}>
              <th className="p-4 font-sans text-[12px] font-medium uppercase tracking-wider text-taupe">Name</th>
              <th className="p-4 font-sans text-[12px] font-medium uppercase tracking-wider text-taupe">Property</th>
              {tab === 'showings' && <th className="p-4 font-sans text-[12px] font-medium uppercase tracking-wider text-taupe">Requested date</th>}
              <th className="p-4 font-sans text-[12px] font-medium uppercase tracking-wider text-taupe">Message</th>
              <th className="p-4 font-sans text-[12px] font-medium uppercase tracking-wider text-taupe">Submitted</th>
              <th className="p-4 font-sans text-[12px] font-medium uppercase tracking-wider text-taupe">Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <tr key={i} className="border-b border-light-gray" style={{ borderWidth: '0 0 0.5px 0' }}>
                  {Array.from({ length: 5 }).map((_, j) => (
                    <td key={j} className="p-4"><div className="h-4 bg-light-gray/60 rounded animate-pulse" /></td>
                  ))}
                </tr>
              ))
            ) : error ? (
              <tr><td colSpan={6} className="p-16 text-center">
                <p className="font-serif text-[20px] text-charcoal mb-2">Failed to load submissions</p>
                <p className="font-sans text-[14px] text-taupe">Check your database connection and try again.</p>
              </td></tr>
            ) : data.length === 0 ? (
              <tr><td colSpan={6} className="p-16 text-center">
                <p className="font-serif text-[20px] text-charcoal mb-2">No {tab === 'showings' ? 'showing requests' : 'agent enquiries'} yet</p>
                <p className="font-sans text-[14px] text-taupe">Submissions from property pages will appear here.</p>
              </td></tr>
            ) : data.map((s, i) => (
              <tr key={s.id} onClick={() => setSelectedId(s.id)}
                className={`border-b border-light-gray last:border-0 cursor-pointer transition-colors ${s.status === 'New' ? 'bg-cream/5 hover:bg-cream/10' : 'hover:bg-light-gray/5'}`}
                style={{ borderWidth: i === data.length - 1 ? '0' : '0 0 0.5px 0', borderLeft: s.status === 'New' ? '2px solid #D4AF37' : 'none' }}>
                <td className="p-4">
                  <p className="font-sans text-[14px] text-charcoal font-medium">{s.name}</p>
                  <p className="font-sans text-[12px] text-taupe">{s.email}</p>
                </td>
                <td className="p-4 font-sans text-[14px] text-charcoal">{s.propertyName}</td>
                {tab === 'showings' && (
                  <td className="p-4 font-sans text-[14px] text-charcoal">
                    {s.date ?? '—'}{s.time && <><br /><span className="text-[12px] text-taupe">{s.time}</span></>}
                  </td>
                )}
                <td className="p-4 font-sans text-[14px] text-taupe max-w-[280px] truncate">{s.message}</td>
                <td className="p-4 font-sans text-[14px] text-taupe whitespace-nowrap">{fmtDate(s.createdAt)}</td>
                <td className="p-4"><StatusBadge status={s.status} variant={statusVariant(s.status)} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Detail panel */}
      {selectedId && active && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setSelectedId(null)} />
          <div className="fixed top-[64px] right-0 bottom-0 w-[340px] bg-white border-l border-light-gray shadow-xl z-50 flex flex-col" style={{ borderWidth: '0 0 0 0.5px' }}>
            <div className="p-6 border-b border-light-gray flex justify-between items-center flex-shrink-0" style={{ borderWidth: '0 0 0.5px 0' }}>
              <h2 className="font-serif text-[18px] text-charcoal m-0">{tab === 'showings' ? 'Showing request' : 'Agent enquiry'}</h2>
              <button onClick={() => setSelectedId(null)} className="text-[24px] text-taupe hover:text-charcoal bg-transparent border-none cursor-pointer leading-none p-0">&times;</button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              <div>
                <StatusBadge status={active.status} variant={statusVariant(active.status)} />
                <p className="font-sans text-[12px] text-taupe mt-2">{fmtDate(active.createdAt)}</p>
              </div>
              <div>
                <p className="font-sans text-[11px] font-medium text-taupe uppercase tracking-wider mb-1">From</p>
                <p className="font-sans text-[15px] font-medium text-charcoal mb-1">{active.name}</p>
                <a href={`mailto:${active.email}`} className="block font-sans text-[13px] text-charcoal no-underline hover:text-taupe mb-1">{active.email}</a>
                {active.phone && <a href={`tel:${active.phone}`} className="block font-sans text-[13px] text-charcoal no-underline hover:text-taupe">{active.phone}</a>}
              </div>
              <div>
                <p className="font-sans text-[11px] font-medium text-taupe uppercase tracking-wider mb-1">Property</p>
                <p className="font-sans text-[13px] text-charcoal">{active.propertyName}</p>
              </div>
              {tab === 'showings' && (active.date || active.time) && (
                <div>
                  <p className="font-sans text-[11px] font-medium text-taupe uppercase tracking-wider mb-1">Requested time</p>
                  <p className="font-sans text-[13px] text-charcoal">{[active.date, active.time].filter(Boolean).join(' · ')}</p>
                </div>
              )}
              <div>
                <p className="font-sans text-[11px] font-medium text-taupe uppercase tracking-wider mb-1">Message</p>
                <p className="font-sans text-[13px] text-charcoal leading-[1.6]">{active.message}</p>
              </div>
            </div>
            <div className="p-5 border-t border-light-gray space-y-2.5 bg-light-gray/5 flex-shrink-0" style={{ borderWidth: '0.5px 0 0 0' }}>
              {nextStatuses(active.status, active.type).map(s => (
                <button key={s} disabled={updating} onClick={() => updateStatus(active.id, s)}
                  className="w-full px-4 py-2.5 rounded-full font-sans text-[13px] font-medium text-charcoal bg-gold hover:bg-gold-dark disabled:opacity-60 transition-colors cursor-pointer border-none">
                  {updating ? 'Updating…' : `Mark as ${s}`}
                </button>
              ))}
              <button onClick={() => { setDeleteId(active.id); setSelectedId(null) }}
                className="w-full px-4 py-2.5 rounded-full font-sans text-[13px] font-medium text-error bg-transparent border-none hover:bg-error/5 transition-colors cursor-pointer">
                Delete
              </button>
            </div>
          </div>
        </>
      )}

      <ConfirmModal
        isOpen={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete submission"
        message="This will permanently remove this submission. This action cannot be undone."
        confirmLabel={deleting ? 'Deleting…' : 'Delete'}
        variant="danger"
      />
    </div>
  )
}
