/**
 * Navigation component — fixed top header used on every page.
 *
 * Desktop: logo left → nav links centre → Contact CTA right.
 * Mobile: logo left → hamburger icon right → slide-in panel from right
 *   with blur backdrop, staggered link animations, and Contact CTA button.
 * Active route: underline indicator on desktop, pill highlight on mobile.
 * Scroll behaviour: shadow appears after 10px scroll.
 */
'use client'

import React, { useEffect, useState, useCallback, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { AurumLogo } from '@/components/AurumLogo'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'

const navLinks = [
  { label: 'Home',       path: '/' },
  { label: 'Properties', path: '/properties' },
  { label: 'Services',   path: '/services' },
  { label: 'About',      path: '/about' },
  { label: 'Blog',       path: '/blog' },
  { label: 'News',       path: '/news' },
]

export function Navigation() {
  const [isOpen,   setIsOpen]   = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()
  const previousPathname = useRef(pathname)
  const unmountTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Derive mounted/visible from single isOpen boolean
  const [mounted, setMounted] = useState(false)

  const openMenu = useCallback(() => {
    if (unmountTimerRef.current) clearTimeout(unmountTimerRef.current)
    setMounted(true)
    // Use a single RAF — by the time the next frame fires the element is in the DOM
    requestAnimationFrame(() => setIsOpen(true))
  }, [])

  const closeMenu = useCallback(() => {
    setIsOpen(false)
    // Wait for the CSS transition (320ms) before removing from DOM
    unmountTimerRef.current = setTimeout(() => setMounted(false), 320)
  }, [])

  const visible = isOpen

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  // Clean up unmount timer on component destroy
  useEffect(() => {
    return () => {
      if (unmountTimerRef.current) clearTimeout(unmountTimerRef.current)
    }
  }, [])

  // close on route change
  useEffect(() => {
    if (previousPathname.current === pathname) return

    previousPathname.current = pathname

    if (!mounted) return

    const timer = window.setTimeout(() => {
      closeMenu()
    }, 0)

    return () => window.clearTimeout(timer)
  }, [pathname, mounted, closeMenu])

  // lock scroll
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  const isActive = (path: string) =>
    path === '/' ? pathname === '/' : pathname.startsWith(path)

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 bg-white border-b border-light-gray transition-shadow duration-300 ${
          scrolled ? 'shadow-nav' : ''
        }`}
        style={{ height: '64px', borderWidth: '0 0 0.5px 0' }}
      >
        <nav className="h-full flex items-center justify-between px-4 md:px-8 max-w-[1300px] mx-auto">

          {/* LOGO */}
          <Link href="/" className="no-underline z-10 flex items-center hover:opacity-80 transition-opacity duration-200">
            <AurumLogo variant="light" height={30} />
          </Link>

          {/* DESKTOP LINKS */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                href={link.path}
                className={`relative font-sans text-[14px] font-medium no-underline px-3 py-1.5 rounded-full transition-all duration-200 ${
                  isActive(link.path)
                    ? 'text-charcoal'
                    : 'text-taupe hover:text-charcoal hover:bg-light-gray/50'
                }`}
              >
                {link.label}
                {/* active — thin underline, no background */}
                {isActive(link.path) && (
                  <span className="absolute bottom-0 left-3 right-3 h-[1.5px] bg-charcoal rounded-full" />
                )}
              </Link>
            ))}
          </div>

          {/* DESKTOP CTA */}
          <div className="hidden lg:flex items-center gap-3">
            <LanguageSwitcher />
            <Link
              href="/contact"
              className={`font-sans text-[13px] font-medium px-5 py-2 rounded-full transition-all duration-200 no-underline border ${
                isActive('/contact')
                  ? 'bg-charcoal text-white border-charcoal'
                  : 'bg-gold hover:bg-gold-dark text-charcoal border-gold hover:border-gold-dark'
              }`}
            >
              Contact us
            </Link>
          </div>

          {/* MOBILE TRIGGER — grid icon (four dots) */}
          <button
            onClick={isOpen ? closeMenu : openMenu}
            className="lg:hidden relative w-10 h-10 flex items-center justify-center bg-transparent border-none cursor-pointer z-10"
            aria-label={isOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isOpen}
          >
            {isOpen && visible ? (
              /* X icon when open */
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-charcoal transition-all duration-200">
                <path d="M18 6 6 18M6 6l12 12"/>
              </svg>
            ) : (
              /* Staggered lines icon — different from filter drawer */
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-charcoal">
                <path d="M4 6h16"/>
                <path d="M4 12h10"/>
                <path d="M4 18h13"/>
              </svg>
            )}
          </button>
        </nav>
      </header>

      {/* MOBILE MENU — slides from right, blurred backdrop */}
      {mounted && (
        <div
          className="fixed inset-0 z-40 lg:hidden transition-all duration-300"
          style={{
            backdropFilter:         visible ? 'blur(4px)'              : 'blur(0px)',
            WebkitBackdropFilter:   visible ? 'blur(4px)'              : 'blur(0px)',
            backgroundColor:        visible ? 'rgba(31,31,31,0.35)'    : 'rgba(31,31,31,0)',
          }}
          onClick={closeMenu}
        >
          {/* PANEL — slides in from right */}
          <div
            className="absolute top-0 right-0 h-full bg-white flex flex-col"
            style={{
              width: 'min(340px, 85vw)',
              transform:  visible ? 'translateX(0)'    : 'translateX(100%)',
              transition: 'transform 0.32s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow:  '-8px 0 40px rgba(0,0,0,0.1)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* panel header */}
            <div
              className="flex items-center justify-between px-6 py-0"
              style={{ height: '64px', borderBottom: '0.5px solid #E8E6E1' }}
            >
              <span className="font-serif text-[16px] text-charcoal">Aurum Realty</span>
              <button
                onClick={closeMenu}
                className="w-9 h-9 flex items-center justify-center text-taupe hover:text-charcoal transition-colors bg-transparent border-none cursor-pointer rounded-sm hover:bg-light-gray/40"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                  <path d="M18 6 6 18M6 6l12 12"/>
                </svg>
              </button>
            </div>

            {/* nav links */}
            <div className="flex-1 overflow-y-auto px-4 py-6">
              <nav className="flex flex-col gap-1">
                {navLinks.map((link, i) => (
                  <Link
                    key={link.path}
                    href={link.path}
                    onClick={closeMenu}
                    className={`flex items-center justify-between px-4 py-3 rounded-sm font-sans text-[15px] font-medium no-underline transition-all duration-200 ${
                      isActive(link.path)
                        ? 'bg-light-gray/60 text-charcoal'
                        : 'text-taupe hover:text-charcoal hover:bg-light-gray/30'
                    }`}
                    style={{
                      transitionDelay: visible ? `${i * 30}ms` : '0ms',
                      opacity:  visible ? 1 : 0,
                      transform: visible ? 'translateX(0)' : 'translateX(16px)',
                      transition: `opacity 0.28s ease ${i * 30}ms, transform 0.28s ease ${i * 30}ms, background-color 0.15s ease`,
                    }}
                  >
                    <span>{link.label}</span>
                    {isActive(link.path) && (
                      <span className="w-1.5 h-1.5 rounded-full bg-gold flex-shrink-0" />
                    )}
                  </Link>
                ))}
              </nav>

              {/* divider */}
              <div className="my-5 border-t border-light-gray" style={{ borderWidth: '0.5px' }} />

              {/* mobile CTA */}
              <Link
                href="/contact"
                onClick={closeMenu}
                className={`flex items-center justify-center w-full py-3.5 rounded-full font-sans text-[14px] font-medium no-underline transition-all duration-200 ${
                  isActive('/contact')
                    ? 'bg-charcoal text-white'
                    : 'bg-gold hover:bg-gold-dark text-charcoal'
                }`}
                style={{
                  opacity:   visible ? 1 : 0,
                  transform: visible ? 'translateX(0)' : 'translateX(16px)',
                  transition: `opacity 0.28s ease ${navLinks.length * 30 + 20}ms, transform 0.28s ease ${navLinks.length * 30 + 20}ms`,
                }}
              >
                Contact us
              </Link>
            </div>

            {/* panel footer */}
            <div className="px-6 py-4 border-t border-light-gray flex items-center justify-between" style={{ borderWidth: '0.5px 0 0 0' }}>
              <p className="font-sans text-[12px] text-taupe">
                +1 (555) 123-4567 · hello@aurumrealty.com
              </p>
              <LanguageSwitcher />
            </div>
          </div>
        </div>
      )}

    </>
  )
}
