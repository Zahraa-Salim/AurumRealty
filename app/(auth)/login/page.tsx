'use client'

import React, { Suspense, useState } from 'react'
import Link from 'next/link'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { AurumLogo } from '@/components/AurumLogo'

function LoginForm() {
  const router       = useRouter()
  const searchParams = useSearchParams()

  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)
  const [focused,  setFocused]  = useState<string | null>(null)
  const roleChangedNotice = searchParams.get('reason') === 'role_changed'
  const displayError = error || (searchParams.get('error') ? 'Invalid email or password.' : '')

  const handleSubmit = async () => {
    if (!email.trim() || !password) {
      setError('Please enter your email and password.')
      return
    }

    setLoading(true)
    setError('')

    const result = await signIn('credentials', {
      email:    email.trim().toLowerCase(),
      password,
      redirect: false,
    })

    setLoading(false)

    if (result?.error) {
      setError('Invalid email or password.')
    } else {
      router.push('/dashboard')
      router.refresh()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSubmit()
  }

  const ic = (id: string) =>
    `w-full h-[48px] px-4 font-sans text-[15px] text-charcoal bg-white border rounded-sm focus:outline-none transition-all duration-200 ${
      focused === id ? 'border-charcoal' : 'border-light-gray'
    }`

  return (
    <div className="min-h-screen bg-cream flex flex-col items-center justify-center px-4">

      {/* Logo */}
      <div className="mb-10">
        <AurumLogo variant="light" height={36} />
      </div>

      {/* Card */}
      <div className="w-full max-w-[420px] bg-white border border-light-gray rounded-sm p-10" style={{ borderWidth: '0.5px' }}>
        <h1 className="font-serif text-[28px] text-charcoal mb-1">Sign in</h1>
        <p className="font-sans text-[13px] text-taupe mb-8">Dashboard access for Aurum team members only.</p>

        <div className="space-y-5">
          {roleChangedNotice && (
            <div className="px-4 py-3 bg-gold/10 border border-gold/30 rounded-sm" style={{ borderWidth: '0.5px' }}>
              <p className="font-sans text-[13px] text-charcoal">
                Your permissions have been updated. Please sign in again.
              </p>
            </div>
          )}

          <div className="flex flex-col gap-2">
            <label className="font-sans text-[13px] font-medium text-charcoal">Email address</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onFocus={() => setFocused('email')}
              onBlur={() => setFocused(null)}
              onKeyDown={handleKeyDown}
              placeholder="you@aurumrealty.com"
              autoComplete="email"
              className={ic('email')}
              style={{ borderWidth: focused === 'email' ? '1px' : '0.5px' }}
              disabled={loading}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-sans text-[13px] font-medium text-charcoal">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onFocus={() => setFocused('password')}
              onBlur={() => setFocused(null)}
              onKeyDown={handleKeyDown}
              placeholder="Enter your password"
              autoComplete="current-password"
              className={ic('password')}
              style={{ borderWidth: focused === 'password' ? '1px' : '0.5px' }}
              disabled={loading}
            />
          </div>

        </div>

        {/* Error */}
        {displayError && (
          <div className="mt-5 px-4 py-3 bg-error/5 border border-error/20 rounded-sm" style={{ borderWidth: '0.5px' }}>
            <p className="font-sans text-[13px] text-error">{displayError}</p>
          </div>
        )}

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full mt-7 h-[48px] rounded-full font-sans text-[14px] font-medium bg-gold hover:bg-gold-dark text-charcoal transition-colors border-none cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? 'Signing in…' : 'Sign in'}
        </button>

        <p className="font-sans text-[12px] text-taupe text-center mt-6">
          Forgot your password? Contact{' '}
          <a href="mailto:admin@aurumrealty.com" className="text-charcoal hover:text-taupe underline">
            admin@aurumrealty.com
          </a>
        </p>
      </div>

      {/* Back to site */}
      <Link href="/" className="mt-8 font-sans text-[13px] text-taupe hover:text-charcoal transition-colors no-underline">
        ← Back to public site
      </Link>
    </div>
  )
}

// Wrap in Suspense — useSearchParams() requires it in Next.js 16
export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}
