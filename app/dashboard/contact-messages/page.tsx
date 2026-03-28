'use client'

import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { DashboardAccessDenied } from '@/components/dashboard/DashboardAccessDenied'
import { StatusBadge, ConfirmModal } from '@/components/dashboard/DashboardShared'
import { hasAnyPermission } from '@/lib/rbac'

type Message = {
  id: number
  name: string
  email: string
  phone: string | null
  message: string
  status: string
  createdAt: string
  assignedTo: { id: number; name: string } | null
}

const statusVariant = (s: string): 'green' | 'gold' | 'gray' => {
  if (s === 'Unread')  return 'green'
  if (s === 'Replied') return 'gold'
  return 'gray'
}

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })

export default function DashboardContactMessagesPage() {
  const { data: session, status } = useSession()
  const [messages,   setMessages]   = useState<Message[]>([])
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState(false)
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [deleteId,   setDeleteId]   = useState<number | null>(null)
  const [updating,   setUpdating]   = useState(false)
  const [deleting,   setDeleting]   = useState(false)

  const permissions = session?.user?.permissions ?? []
  const canView    = hasAnyPermission(permissions, ['submissions.view', 'submissions.view.own'])
  const ownOnly    = !hasAnyPermission(permissions, ['submissions.view']) &&
                     hasAnyPermission(permissions, ['submissions.view.own'])
  const canUpdate  = hasAnyPermission(permissions, ['submissions.update'])
  const canDelete  = hasAnyPermission(permissions, ['submissions.delete'])

  useEffect(() => {
    if (status !== 'authenticated' || !canView) return
    fetch('/api/contact')
      .then(r => r.json())
      .then(d => { setMessages(d); setLoading(false) })
      .catch(() => { setError(true); setLoading(false) })
  }, [canView, status])

  const active = messages.find(m => m.id === selectedId)

  const updateStatus = async (id: number, newStatus: string) => {
    setUpdating(true)
    try {
      const res = await fetch(`/api/contact/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (res.ok) {
        setMessages(prev => prev.map(m => m.id === id ? { ...m, status: newStatus } : m))
      }
    } catch { /* silent */ }
    setUpdating(false)
  }

  const handleDelete = async () => {
    if (!deleteId) return
    setDeleting(true)
    try {
      await fetch(`/api/contact/${deleteId}`, { method: 'DELETE' })
      setMessages(prev => prev.filter(m => m.id !== deleteId))
      setSelectedId(null)
    } catch { /* silent */ }
    setDeleting(false)
    setDeleteId(null)
  }

  const exportCSV = () => {
    const rows = [
      ['ID', 'Name', 'Email', 'Phone', 'Message', 'Assigned To', 'Status', 'Date'],
      ...messages.map(m => [m.id, m.name, m.email, m.phone ?? '', `"${m.message.replace(/"/g, '""')}"`, m.assignedTo?.name ?? '', m.status, fmtDate(m.createdAt)]),
    ]
    const csv  = rows.map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a'); a.href = url; a.download = 'contact-messages.csv'; a.click()
    URL.revokeObjectURL(url)
  }

  if (status === 'loading') {
    return (
      <div className="max-w-4xl mx-auto pt-12 text-center">
        <p className="font-sans text-[14px] text-taupe">Loading contact messages…</p>
      </div>
    )
  }

  if (!canView) {
    return <DashboardAccessDenied message="You do not have permission to view contact messages." />
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 relative">

      {/* Scoped-user banner */}
      {ownOnly && (
        <div className="px-4 py-3 bg-gold/10 border border-gold/30 rounded-sm font-sans text-[13px] text-charcoal" style={{ borderWidth: '0.5px' }}>
          Showing messages assigned to you. Contact a Super Admin to access all messages.
        </div>
      )}

      <div className="flex justify-end">
        <button onClick={exportCSV}
          className="px-6 py-2.5 rounded-full font-sans text-[13px] font-medium text-charcoal bg-transparent border border-charcoal hover:bg-light-gray/20 transition-colors"
          style={{ borderWidth: '0.5px' }}>
          Export CSV
        </button>
      </div>

      <div className="bg-white border border-light-gray rounded-sm overflow-x-auto" style={{ borderWidth: '0.5px' }}>
        <table className="w-full text-left border-collapse min-w-[900px]">
          <thead>
            <tr className="border-b border-light-gray bg-light-gray/10" style={{ borderWidth: '0 0 0.5px 0' }}>
              {['Name', 'Email', 'Message preview', 'Assigned to', 'Date', 'Status'].map(h => (
                <th key={h} className="p-4 font-sans text-[12px] font-medium uppercase tracking-wider text-taupe">{h}</th>
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
                <p className="font-serif text-[20px] text-charcoal mb-2">Failed to load messages</p>
                <p className="font-sans text-[14px] text-taupe">Check your database connection and try again.</p>
              </td></tr>
            ) : messages.length === 0 ? (
              <tr><td colSpan={6} className="p-16 text-center">
                <p className="font-serif text-[20px] text-charcoal mb-2">No messages yet</p>
                <p className="font-sans text-[14px] text-taupe">Contact form submissions will appear here.</p>
              </td></tr>
            ) : messages.map((msg, i) => (
              <tr key={msg.id} onClick={() => setSelectedId(msg.id)}
                className={`border-b border-light-gray last:border-0 cursor-pointer transition-colors ${msg.status === 'Unread' ? 'bg-cream/10 hover:bg-cream/20' : 'hover:bg-light-gray/5'}`}
                style={{ borderWidth: i === messages.length - 1 ? '0' : '0 0 0.5px 0', borderLeft: msg.status === 'Unread' ? '2px solid #D4AF37' : 'none' }}>
                <td className="p-4 font-sans text-[14px] text-charcoal font-medium">{msg.name}</td>
                <td className="p-4 font-sans text-[14px] text-charcoal">{msg.email}</td>
                <td className="p-4 max-w-[280px]">
                  <p className="font-sans text-[13px] text-taupe truncate">{msg.message}</p>
                </td>
                <td className="p-4 font-sans text-[13px] text-taupe">
                  {msg.assignedTo ? (
                    <span className="px-2 py-0.5 bg-charcoal/8 text-charcoal rounded-sm text-[12px]">{msg.assignedTo.name}</span>
                  ) : (
                    <span className="text-light-gray/80 italic text-[12px]">Unassigned</span>
                  )}
                </td>
                <td className="p-4 font-sans text-[13px] text-taupe whitespace-nowrap">{fmtDate(msg.createdAt)}</td>
                <td className="p-4"><StatusBadge status={msg.status} variant={statusVariant(msg.status)} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Detail panel */}
      {selectedId && active && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setSelectedId(null)} />
          <div className="fixed top-[64px] right-0 bottom-0 w-[320px] bg-white border-l border-light-gray shadow-xl z-50 flex flex-col" style={{ borderWidth: '0 0 0 0.5px' }}>
            <div className="p-6 border-b border-light-gray flex justify-between items-center" style={{ borderWidth: '0 0 0.5px 0' }}>
              <h2 className="font-serif text-[18px] text-charcoal m-0">Message details</h2>
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
                <p className="font-sans text-[11px] font-medium text-taupe uppercase tracking-wider mb-1">Assigned to</p>
                <p className="font-sans text-[13px] text-charcoal">{active.assignedTo?.name ?? 'Unassigned'}</p>
              </div>
              <div>
                <p className="font-sans text-[11px] font-medium text-taupe uppercase tracking-wider mb-1">Message</p>
                <p className="font-sans text-[13px] text-charcoal leading-[1.6]">{active.message}</p>
              </div>
            </div>
            {canUpdate && (
              <div className="p-5 border-t border-light-gray space-y-2.5 bg-light-gray/5" style={{ borderWidth: '0.5px 0 0 0' }}>
                {active.status === 'Unread' && (
                  <button disabled={updating} onClick={() => updateStatus(active.id, 'Read')}
                    className="w-full px-4 py-2.5 rounded-full font-sans text-[13px] font-medium text-charcoal bg-white border border-charcoal hover:bg-light-gray/20 disabled:opacity-60 transition-colors cursor-pointer"
                    style={{ borderWidth: '0.5px' }}>
                    {updating ? 'Updating…' : 'Mark as read'}
                  </button>
                )}
                {active.status !== 'Replied' && (
                  <button disabled={updating} onClick={() => updateStatus(active.id, 'Replied')}
                    className="w-full px-4 py-2.5 rounded-full font-sans text-[13px] font-medium text-charcoal bg-gold hover:bg-gold-dark disabled:opacity-60 transition-colors cursor-pointer border-none">
                    {updating ? 'Updating…' : 'Mark as replied'}
                  </button>
                )}
                {canDelete && (
                  <button onClick={() => { setDeleteId(active.id); setSelectedId(null) }}
                    className="w-full px-4 py-2.5 rounded-full font-sans text-[13px] font-medium text-error bg-transparent border-none hover:bg-error/5 transition-colors cursor-pointer">
                    Delete message
                  </button>
                )}
              </div>
            )}
          </div>
        </>
      )}

      <ConfirmModal
        isOpen={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete message"
        message="This will permanently remove this contact message. This action cannot be undone."
        confirmLabel={deleting ? 'Deleting…' : 'Delete'}
        variant="danger"
      />
    </div>
  )
}
