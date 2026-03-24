'use client'

import React, { useState } from 'react'
import type {
  ContactPageContent,
  SiteSettingsGeneralContent,
  SiteSettingsHoursContent,
  SiteSettingsSocialContent,
} from '@/lib/site-content'

type FormState = 'idle' | 'submitting' | 'success' | 'error'

type ContactPageClientProps = {
  header: ContactPageContent
  general: SiteSettingsGeneralContent
  hours: SiteSettingsHoursContent
  social: SiteSettingsSocialContent
}

export default function ContactPageClient({
  header,
  general,
  hours,
  social,
}: ContactPageClientProps) {
  const [isFocused, setIsFocused] = useState<string | null>(null)
  const [formState, setFormState] = useState<FormState>('idle')
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormState('submitting')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error('Failed')
      setFormState('success')
      setForm({ name: '', email: '', phone: '', message: '' })
    } catch {
      setFormState('error')
    }
  }

  const inputCls = () =>
    'h-[44px] px-4 font-sans text-[14px] text-charcoal bg-white border border-light-gray rounded-sm placeholder:text-mid-gray placeholder:italic focus:outline-none focus:border-charcoal focus:shadow-focus transition-all duration-200'

  return (
    <main className="w-full bg-white pb-24">
      <section className="bg-cream py-16 px-4 md:px-8">
        <div className="max-w-[1200px] mx-auto">
          <h1 className="font-serif text-[40px] md:text-[48px] text-charcoal leading-[1.1] mb-4">
            {header.title}
          </h1>
          <p className="font-sans text-[16px] text-taupe">{header.subtitle}</p>
        </div>
      </section>

      <section className="py-16 md:py-24 px-4 md:px-8 max-w-[1200px] mx-auto">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-20">
          <div className="w-full lg:w-[60%]">
            {formState === 'error' && (
              <div className="mb-6 p-4 bg-error/5 border border-error/20 rounded-sm" style={{ borderWidth: '0.5px' }}>
                <p className="font-sans text-[14px] text-error">Something went wrong. Please check your connection and try again.</p>
                <button
                  onClick={() => setFormState('idle')}
                  className="font-sans text-[13px] text-error underline bg-transparent border-none cursor-pointer mt-1 p-0"
                >
                  Try again
                </button>
              </div>
            )}

            {formState === 'success' ? (
              <div className="flex flex-col items-center text-center py-16">
                <div className="w-16 h-16 rounded-full bg-gold/15 flex items-center justify-center mb-6">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                </div>
                <h2 className="font-serif text-[28px] text-charcoal mb-3">Message sent</h2>
                <p className="font-sans text-[15px] text-taupe leading-[1.7] mb-8 max-w-[380px]">
                  Thank you for reaching out. A member of our team will be in touch with you within one business day.
                </p>
                <button
                  onClick={() => setFormState('idle')}
                  className="font-sans text-[13px] font-medium text-charcoal underline bg-transparent border-none cursor-pointer"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="flex flex-col gap-2">
                  <label htmlFor="name" className="font-sans text-[13px] font-medium text-charcoal">
                    Name <span className="text-gold">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    required
                    placeholder="Your full name"
                    value={form.name}
                    onChange={(e) => setForm((current) => ({ ...current, name: e.target.value }))}
                    onFocus={() => setIsFocused('name')}
                    onBlur={() => setIsFocused(null)}
                    className={`w-full ${inputCls()}`}
                    style={{ borderWidth: isFocused === 'name' ? '1px' : '0.5px' }}
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="email" className="font-sans text-[13px] font-medium text-charcoal">
                    Email <span className="text-gold">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    required
                    placeholder="your.email@example.com"
                    value={form.email}
                    onChange={(e) => setForm((current) => ({ ...current, email: e.target.value }))}
                    onFocus={() => setIsFocused('email')}
                    onBlur={() => setIsFocused(null)}
                    className={`w-full ${inputCls()}`}
                    style={{ borderWidth: isFocused === 'email' ? '1px' : '0.5px' }}
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="phone" className="font-sans text-[13px] font-medium text-charcoal">
                    Phone
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    placeholder={general.phone || '+1 (555) 000-0000'}
                    value={form.phone}
                    onChange={(e) => setForm((current) => ({ ...current, phone: e.target.value }))}
                    onFocus={() => setIsFocused('phone')}
                    onBlur={() => setIsFocused(null)}
                    className={`w-full ${inputCls()}`}
                    style={{ borderWidth: isFocused === 'phone' ? '1px' : '0.5px' }}
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="message" className="font-sans text-[13px] font-medium text-charcoal">
                    Message <span className="text-gold">*</span>
                  </label>
                  <textarea
                    id="message"
                    required
                    rows={5}
                    placeholder="How can we assist you?"
                    value={form.message}
                    onChange={(e) => setForm((current) => ({ ...current, message: e.target.value }))}
                    onFocus={() => setIsFocused('message')}
                    onBlur={() => setIsFocused(null)}
                    className="w-full p-4 font-sans text-[14px] text-charcoal bg-white border border-light-gray rounded-sm placeholder:text-mid-gray placeholder:italic focus:outline-none focus:border-charcoal focus:shadow-focus transition-all duration-200 resize-y min-h-[120px]"
                    style={{ borderWidth: isFocused === 'message' ? '1px' : '0.5px' }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={formState === 'submitting'}
                  className="w-full mt-4 bg-gold hover:bg-gold-dark text-charcoal font-sans text-[14px] font-medium py-3.5 rounded-full transition-colors duration-200 border-none cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {formState === 'submitting' ? 'Sending…' : 'Send message'}
                </button>

                <p className="font-sans text-[12px] text-mid-gray text-center">
                  Required fields marked <span className="text-gold">*</span>. We respond within one business day.
                </p>
              </form>
            )}
          </div>

          <div className="w-full lg:w-[40%]">
            <div
              className="sticky top-[96px] bg-white border-light-gray rounded-sm p-10"
              style={{ borderWidth: '0.5px' }}
            >
              <div className="flex flex-col gap-8">
                <div>
                  <p className="font-sans text-[12px] font-medium text-mid-gray mb-2 uppercase tracking-wider">
                    Address
                  </p>
                  <p className="font-sans text-[14px] text-charcoal leading-[1.6]">
                    {general.companyName && (
                      <>
                        {general.companyName}
                        <br />
                      </>
                    )}
                    {general.addressLines.map((line, index) => (
                      <React.Fragment key={`address-${index}`}>
                        {line}
                        {index < general.addressLines.length - 1 && <br />}
                      </React.Fragment>
                    ))}
                  </p>
                </div>

                <div>
                  <p className="font-sans text-[12px] font-medium text-mid-gray mb-2 uppercase tracking-wider">
                    Contact
                  </p>
                  <p className="font-sans text-[14px] text-charcoal mb-1">{general.phone}</p>
                  <a
                    href={`mailto:${general.contactEmail}`}
                    className="font-sans text-[14px] text-charcoal no-underline hover:text-taupe transition-colors duration-200"
                  >
                    {general.contactEmail}
                  </a>
                </div>

                <div>
                  <p className="font-sans text-[12px] font-medium text-mid-gray mb-2 uppercase tracking-wider">
                    Hours
                  </p>
                  <div className="space-y-1">
                    {hours.rows.map((row, index) => (
                      <p key={`hours-${index}`} className="font-sans text-[14px] text-charcoal leading-[1.6]">
                        {row.label}: {row.value}
                      </p>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="font-sans text-[12px] font-medium text-mid-gray mb-2 uppercase tracking-wider">
                    Social
                  </p>
                  <div className="flex flex-col gap-2">
                    {social.links
                      .filter((link) => link.label.trim() && link.url.trim())
                      .map((link) => (
                        <a
                          key={link.label}
                          href={link.url}
                          target="_blank"
                          rel="noreferrer"
                          className="font-sans text-[14px] text-charcoal no-underline hover:text-gold transition-colors duration-200"
                        >
                          {link.label}
                        </a>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
