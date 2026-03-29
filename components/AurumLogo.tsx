/**
 * AurumLogo — hexagon icon + HTML text wordmark.
 *
 * Uses AurumIcon (pure SVG) beside real <span> elements so the browser
 * renders the font natively — much crisper than SVG <text> nodes.
 *
 * variant="light" → charcoal text (white/cream backgrounds)
 * variant="dark"  → white text   (dark/charcoal backgrounds)
 * locale="ar"     → Arabic wordmark: أوروم / ريالتي
 */
import React from 'react'

type LogoVariant = 'light' | 'dark'

interface AurumLogoProps {
  variant?: LogoVariant
  height?: number
  locale?: string
}

export function AurumLogo({ variant = 'light', height = 32, locale = 'en' }: AurumLogoProps) {
  const isAr       = locale === 'ar'
  const textColor  = variant === 'dark' ? 'text-white'    : 'text-charcoal'
  const muteColor  = variant === 'dark' ? 'text-[#A8A39F]' : 'text-[#A8A39F]'
  const iconSize   = Math.round(height * 0.875) // slightly smaller than line height

  return (
    <div className="flex items-center gap-2.5" aria-label={isAr ? 'أوروم ريالتي' : 'Aurum Realty'}>
      <AurumIcon size={iconSize} />
      <div className="flex flex-col leading-none gap-[3px]">
        {isAr ? (
          <>
            <span
              className={`font-sans font-semibold ${textColor}`}
              style={{ fontSize: Math.round(height * 0.44), letterSpacing: '0.01em' }}
            >
              أوروم
            </span>
            <span
              className={`font-sans font-normal ${muteColor}`}
              style={{ fontSize: Math.round(height * 0.28), letterSpacing: '0.06em' }}
            >
              ريالتي
            </span>
          </>
        ) : (
          <>
            <span
              className={`font-serif font-normal ${textColor}`}
              style={{ fontSize: Math.round(height * 0.47), letterSpacing: '0.04em' }}
            >
              AURUM
            </span>
            <span
              className={`font-sans font-normal ${muteColor}`}
              style={{ fontSize: Math.round(height * 0.30), letterSpacing: '0.14em' }}
            >
              REALTY
            </span>
          </>
        )}
      </div>
    </div>
  )
}

export function AurumIcon({ size = 32 }: { size?: number }) {
  const gold = '#D4AF37'
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <polygon points="16,2 30,9 30,23 16,30 2,23 2,9" fill="none" stroke={gold} strokeWidth="1.5" />
      <polygon points="16,8 24,12 24,20 16,24 8,20 8,12" fill={gold} opacity="0.2" />
      <line x1="16" y1="2"  x2="16" y2="30" stroke={gold} strokeWidth="1" opacity="0.45" />
      <line x1="2"  y1="9"  x2="30" y2="23" stroke={gold} strokeWidth="1" opacity="0.45" />
      <line x1="30" y1="9"  x2="2"  y2="23" stroke={gold} strokeWidth="1" opacity="0.45" />
    </svg>
  )
}
