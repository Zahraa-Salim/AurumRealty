/**
 * DashboardProfilePage — /dashboard/profile
 *
 * Logged-in user's personal profile page. Sections:
 *   - Avatar + name header
 *   - Personal info: name, email, role (read-only), phone
 *   - Change password: current, new, confirm
 *   - Notification preferences: email toggles
 * Accessible by clicking the user footer in the sidebar.
 */

'use client'

import React, { useState } from 'react'
import { signOut, useSession } from 'next-auth/react'
import { hasAnyPermission, SYSTEM_ROLE_TEMPLATES } from '@/lib/rbac'

type SaveState = 'idle' | 'saving' | 'saved'

export default function DashboardProfilePage() {
  const { data: session } = useSession()
  const [infoState,     setInfoState]     = useState<SaveState>('idle')
  const [passwordState, setPasswordState] = useState<SaveState>('idle')
  const [focused,       setFocused]       = useState<string | null>(null)
  const [passwordError, setPasswordError] = useState('')
  const [passwordSignOutNotice, setPasswordSignOutNotice] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [notifs, setNotifs] = useState({
    newMessage:  true,
    newShowing:  true,
    blogPublish: false,
    weeklyReport:true,
  })

  const save = (setter: (s: SaveState) => void) => {
    setter('saving')
    setTimeout(() => {
      setter('saved')
      setTimeout(() => setter('idle'), 2000)
    }, 700)
  }

  const inputCls = () =>
    `w-full h-[44px] px-4 font-sans text-[14px] text-charcoal bg-white border border-light-gray rounded-sm focus:outline-none focus:border-charcoal transition-all duration-200`

  const displayName = session?.user?.name || 'Account user'
  const displayEmail = session?.user?.email || 'No email available'
  const displayRole = session?.user?.role || 'Team member'
  const permissions = session?.user?.permissions ?? []
  const roleTemplate = SYSTEM_ROLE_TEMPLATES.find((template) => template.name === displayRole)
  const accessHighlights = [
    hasAnyPermission(permissions, ['properties.create', 'properties.edit']) ? 'manage properties' : '',
    hasAnyPermission(permissions, ['blog.create', 'blog.edit']) ? 'manage blog posts' : '',
    hasAnyPermission(permissions, ['news.create', 'news.edit']) ? 'manage news articles' : '',
    hasAnyPermission(permissions, ['pages.edit']) ? 'edit website pages' : '',
    hasAnyPermission(permissions, ['submissions.view', 'submissions.update']) ? 'review submissions' : '',
    hasAnyPermission(permissions, ['users.view', 'users.edit', 'roles.view', 'roles.edit']) ? 'manage users and roles' : '',
    hasAnyPermission(permissions, ['settings.view', 'settings.edit']) ? 'update site settings' : '',
  ].filter(Boolean)
  const accessSummary = accessHighlights.length > 0
    ? `You can ${accessHighlights.join(', ')}.`
    : 'Your account has limited dashboard access right now.'
  const handlePasswordUpdate = async () => {
    if (!session?.user?.id) {
      setPasswordError('You must be signed in to change your password.')
      return
    }

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError('Fill in all password fields first.')
      return
    }

    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters.')
      return
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New password and confirmation do not match.')
      return
    }

    setPasswordState('saving')
    setPasswordError('')
    setPasswordSignOutNotice(false)

    try {
      const res = await fetch(`/api/users/${session.user.id}/password`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      })

      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update password.')
      }

      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setPasswordState('saved')
      window.setTimeout(() => setPasswordSignOutNotice(true), 2500)
      window.setTimeout(() => {
        void signOut({ callbackUrl: '/login' })
      }, 3000)
    } catch (error) {
      setPasswordError(error instanceof Error ? error.message : 'Failed to update password.')
      setPasswordSignOutNotice(false)
      setPasswordState('idle')
    }
  }

  const Toggle = ({ checked, onChange }: { checked: boolean; onChange: () => void }) => (
    <div
      className={`w-10 h-5 rounded-full relative transition-colors cursor-pointer flex-shrink-0 ${checked ? 'bg-charcoal' : 'bg-light-gray'}`}
      onClick={onChange}
    >
      <div className={`w-3 h-3 bg-white rounded-full absolute top-1 transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
    </div>
  )

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12">

      {/* Avatar header */}
      <div className="bg-white border border-light-gray rounded-sm p-8 flex items-center gap-6" style={{ borderWidth:'0.5px' }}>
        <div className="w-20 h-20 rounded-full bg-gold/20 flex items-center justify-center flex-shrink-0 cursor-pointer hover:bg-gold/30 transition-colors group relative">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#1F1F1F" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="8" r="4"/><path d="M4 20c0-3.3 3.6-6 8-6s8 2.7 8 6"/>
          </svg>
          <div className="absolute inset-0 rounded-full bg-charcoal/0 group-hover:bg-charcoal/10 transition-colors flex items-center justify-center">
            <span className="font-sans text-[11px] text-white opacity-0 group-hover:opacity-100 transition-opacity">Change</span>
          </div>
        </div>
        <div>
          <h1 className="font-serif text-[24px] text-charcoal mb-1">{displayName}</h1>
          <p className="font-sans text-[14px] text-taupe mb-1">{displayEmail}</p>
          <span className="inline-block px-3 py-1 bg-gold text-charcoal font-sans text-[11px] font-medium rounded-full">{displayRole}</span>
          {roleTemplate?.description && (
            <p className="font-sans text-[13px] text-taupe mt-3 max-w-[460px]">{roleTemplate.description}</p>
          )}
        </div>
      </div>

      <div className="bg-white border border-light-gray rounded-sm p-8" style={{ borderWidth:'0.5px' }}>
        <h2 className="font-serif text-[18px] text-charcoal mb-2">Role & access</h2>
        <div className="border border-light-gray rounded-sm p-5 bg-[#F7F6F3]" style={{ borderWidth:'0.5px' }}>
          <p className="font-sans text-[13px] text-taupe m-0">
            Your current role is <span className="font-medium text-charcoal">{displayRole}</span>.
            {roleTemplate?.description ? ` ${roleTemplate.description}` : ''}
          </p>
          <p className="font-sans text-[13px] text-taupe mt-3 mb-0">
            {accessSummary}
          </p>
          {hasAnyPermission(permissions, ['users.view', 'roles.view', 'users.edit', 'roles.edit']) && (
            <p className="font-sans text-[12px] text-mid-gray mt-3 mb-0">
              Need changes to your role or permissions? A Super Admin can update them from Users &amp; roles.
            </p>
          )}
          {!hasAnyPermission(permissions, ['users.view', 'roles.view', 'users.edit', 'roles.edit']) && (
            <p className="font-sans text-[12px] text-mid-gray mt-3 mb-0">
              If you need more access, ask a Super Admin to update your assigned role.
            </p>
          )}
        </div>
      </div>

      {/* Personal info */}
      <div className="bg-white border border-light-gray rounded-sm p-8" style={{ borderWidth:'0.5px' }}>
        <h2 className="font-serif text-[18px] text-charcoal mb-6">Personal information</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6">
          {[
            { id:'firstName', label:'First name',    value:'Admin',                  type:'text'  },
            { id:'lastName',  label:'Last name',     value:'',                       type:'text'  },
            { id:'email',     label:'Email address', value:displayEmail,             type:'email' },
            { id:'phone',     label:'Phone number',  value:'+1 (555) 000-0000',      type:'tel'   },
          ].map(({ id, label, value, type }, index) => (
            <div key={id} className="flex flex-col gap-2">
              <label className="font-sans text-[13px] font-medium text-charcoal">{label}</label>
              <input
                type={type}
                defaultValue={index === 0 ? displayName.split(' ')[0] || '' : index === 1 ? displayName.split(' ').slice(1).join(' ') : value}
                onFocus={() => setFocused(id)}
                onBlur={() => setFocused(null)}
                className={inputCls()}
                style={{ borderWidth: focused === id ? '1px' : '0.5px' }}
              />
            </div>
          ))}
          <div className="flex flex-col gap-2">
            <label className="font-sans text-[13px] font-medium text-charcoal">Role</label>
            <input type="text" value={displayRole} readOnly className="w-full h-[44px] px-4 font-sans text-[14px] text-taupe bg-light-gray/20 border border-light-gray rounded-sm cursor-not-allowed outline-none" style={{ borderWidth:'0.5px' }} />
          </div>
        </div>
        <div className="flex justify-end">
          <button
            onClick={() => save(setInfoState)}
            disabled={infoState === 'saving'}
            className={`px-8 py-2.5 rounded-full font-sans text-[13px] font-medium transition-colors border-none cursor-pointer ${infoState === 'saved' ? 'bg-success text-white' : 'bg-gold hover:bg-gold-dark text-charcoal'} disabled:opacity-60`}
          >
            {infoState === 'saving' ? 'Saving…' : infoState === 'saved' ? '✓ Saved' : 'Save changes'}
          </button>
        </div>
      </div>

      {/* Change password */}
      <div className="bg-white border border-light-gray rounded-sm p-8" style={{ borderWidth:'0.5px' }}>
        <h2 className="font-serif text-[18px] text-charcoal mb-6">Change password</h2>
        <div className="space-y-4 mb-6">
          {[
            { id:'currentPw',  label:'Current password', placeholder:'Enter current password' },
            { id:'newPw',      label:'New password',      placeholder:'At least 8 characters'  },
            { id:'confirmPw',  label:'Confirm password',  placeholder:'Repeat new password'     },
          ].map(({ id, label, placeholder }) => (
            <div key={id} className="flex flex-col gap-2">
              <label className="font-sans text-[13px] font-medium text-charcoal">{label}</label>
              <input
                type="password"
                value={id === 'currentPw' ? currentPassword : id === 'newPw' ? newPassword : confirmPassword}
                onChange={e => {
                  const value = e.target.value
                  if (id === 'currentPw') setCurrentPassword(value)
                  if (id === 'newPw') setNewPassword(value)
                  if (id === 'confirmPw') setConfirmPassword(value)
                }}
                placeholder={placeholder}
                onFocus={() => setFocused(id)}
                onBlur={() => setFocused(null)}
                className={inputCls()}
                style={{ borderWidth: focused === id ? '1px' : '0.5px' }}
              />
            </div>
          ))}
        </div>
        {passwordError && (
          <p className="mb-4 font-sans text-[13px] text-error">{passwordError}</p>
        )}
        {passwordState === 'saved' && passwordSignOutNotice && (
          <p className="mb-4 font-sans text-[13px] text-taupe">You will be signed out shortly.</p>
        )}
        <div className="flex justify-end">
          <button
            onClick={handlePasswordUpdate}
            disabled={passwordState === 'saving'}
            className={`px-8 py-2.5 rounded-full font-sans text-[13px] font-medium transition-colors border-none cursor-pointer ${passwordState === 'saved' ? 'bg-success text-white' : 'bg-gold hover:bg-gold-dark text-charcoal'} disabled:opacity-60`}
          >
            {passwordState === 'saving' ? 'Updating…' : passwordState === 'saved' ? '✓ Updated' : 'Update password'}
          </button>
        </div>
      </div>

      {/* Notification preferences */}
      <div className="bg-white border border-light-gray rounded-sm p-8" style={{ borderWidth:'0.5px' }}>
        <h2 className="font-serif text-[18px] text-charcoal mb-6">Email notifications</h2>
        <div className="space-y-5">
          {[
            { key:'newMessage',   label:'New contact message',    desc:'When someone submits the contact form' },
            { key:'newShowing',   label:'New showing request',     desc:'When a visitor requests a property showing' },
            { key:'blogPublish',  label:'Blog post published',     desc:'When an editor publishes a new post' },
            { key:'weeklyReport', label:'Weekly summary report',   desc:'Overview of activity every Monday morning' },
          ].map(({ key, label, desc }) => (
            <div key={key} className="flex items-center justify-between gap-4">
              <div>
                <p className="font-sans text-[14px] font-medium text-charcoal">{label}</p>
                <p className="font-sans text-[12px] text-taupe">{desc}</p>
              </div>
              <Toggle
                checked={notifs[key as keyof typeof notifs]}
                onChange={() => setNotifs((n) => ({ ...n, [key]: !n[key as keyof typeof notifs] }))}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Danger zone */}
      <div className="bg-white border border-error/20 rounded-sm p-6" style={{ borderWidth:'0.5px' }}>
        <h2 className="font-serif text-[16px] text-charcoal mb-2">Sign out</h2>
        <p className="font-sans text-[13px] text-taupe mb-4">You will be returned to the login page.</p>
        <button
          type="button"
          onClick={() => void signOut({ callbackUrl: '/login' })}
          className="inline-block px-6 py-2.5 rounded-full font-sans text-[13px] font-medium text-white bg-error hover:bg-error/90 transition-colors border-none cursor-pointer"
        >
          Sign out
        </button>
      </div>
    </div>
  )
}
