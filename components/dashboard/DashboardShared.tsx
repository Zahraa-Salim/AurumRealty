/**
 * StatusBadge — components/dashboard/StatusBadge.tsx
 *
 * Pill-shaped status indicator used in all dashboard tables.
 * Variants: gold (active/published), gray (draft/inactive),
 *           green (new/success), red (error/urgent), cream (neutral).
 */

'use client'

import React from 'react'

type StatusBadgeProps = {
  status: string
  variant: 'gold' | 'gray' | 'green' | 'red' | 'cream'
}

export function StatusBadge({ status, variant }: StatusBadgeProps) {
  const styles = {
    gold:  'bg-gold text-charcoal',
    green: 'bg-success text-white',
    red:   'bg-error text-white',
    cream: 'bg-cream text-charcoal',
    gray:  'bg-light-gray text-charcoal',
  }
  return (
    <span className={`inline-flex items-center justify-center px-3 py-1 rounded-full font-sans text-[11px] font-medium tracking-wide ${styles[variant]}`}>
      {status}
    </span>
  )
}


/**
 * ConfirmModal — components/dashboard/ConfirmModal.tsx
 *
 * Reusable confirmation dialog for destructive actions (delete, deactivate).
 * variant="danger" → red confirm button
 * variant="default" → gold confirm button
 * Renders nothing when isOpen=false.
 */

type ConfirmModalProps = {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmLabel: string
  variant?: 'danger' | 'default'
}

export function ConfirmModal({
  isOpen, onClose, onConfirm,
  title, message, confirmLabel,
  variant = 'default',
}: ConfirmModalProps) {
  if (!isOpen) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/30 backdrop-blur-sm">
      <div
        className="bg-white rounded-sm p-8 max-w-md w-full mx-4 shadow-xl border border-light-gray"
        style={{ borderWidth: '0.5px' }}
      >
        <h3 className="font-serif text-[18px] text-charcoal mb-3">{title}</h3>
        <p className="font-sans text-[14px] text-taupe mb-8 leading-[1.6]">{message}</p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-full font-sans text-[13px] font-medium text-charcoal bg-transparent border border-charcoal hover:bg-light-gray/20 transition-colors"
            style={{ borderWidth: '0.5px' }}
          >
            Cancel
          </button>
          <button
            onClick={() => { onConfirm(); onClose() }}
            className={`px-6 py-2 rounded-full font-sans text-[13px] font-medium transition-colors ${
              variant === 'danger'
                ? 'bg-error hover:bg-error/90 text-white'
                : 'bg-gold hover:bg-gold-dark text-charcoal'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
