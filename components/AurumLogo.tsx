/**
 * AurumLogo — reusable SVG logo component.
 *
 * Two exports:
 *   AurumLogo({ variant, height }) — full wordmark (hexagon icon + "AURUM REALTY" text)
 *     variant="light" → charcoal text (for white/cream backgrounds)
 *     variant="dark"  → white text (for dark/charcoal backgrounds)
 *   AurumIcon({ size }) — icon only, used for favicon and compact contexts.
 *
 * The icon is a faceted hexagon referencing gold crystal geometry.
 */
import React from 'react'

type LogoVariant = 'light' | 'dark'

interface AurumLogoProps {
  variant?: LogoVariant
  height?: number
}

export function AurumLogo({ variant = 'light', height = 32 }: AurumLogoProps) {
  const textColor   = variant === 'dark' ? '#FFFFFF' : '#1F1F1F'
  const subtleColor = '#A8A39F'
  const gold        = '#D4AF37'

  const scale = height / 32
  const w     = Math.round(148 * scale)

  return (
    <svg
      width={w}
      height={height}
      viewBox="0 0 148 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Aurum Realty"
    >
      {/* hexagon outer */}
      <polygon
        points="16,4 28,10 28,22 16,28 4,22 4,10"
        fill="none"
        stroke={gold}
        strokeWidth="1.2"
      />
      {/* hexagon inner fill */}
      <polygon
        points="16,9 23,13 23,19 16,23 9,19 9,13"
        fill={gold}
        opacity="0.2"
      />
      {/* facet lines */}
      <line x1="16" y1="4"  x2="16" y2="28" stroke={gold} strokeWidth="0.8" opacity="0.45" />
      <line x1="4"  y1="10" x2="28" y2="22" stroke={gold} strokeWidth="0.8" opacity="0.45" />
      <line x1="28" y1="10" x2="4"  y2="22" stroke={gold} strokeWidth="0.8" opacity="0.45" />

      {/* AURUM */}
      <text
        x="38" y="14"
        fontFamily="Georgia, 'Times New Roman', serif"
        fontSize="15"
        fontWeight="400"
        fill={textColor}
        letterSpacing="0.04em"
      >
        AURUM
      </text>

      {/* REALTY */}
      <text
        x="38" y="27"
        fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
        fontSize="10"
        fontWeight="400"
        fill={subtleColor}
        letterSpacing="0.14em"
      >
        REALTY
      </text>
    </svg>
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
      aria-label="Aurum Realty"
    >
      <polygon points="16,2 30,9 30,23 16,30 2,23 2,9" fill="none" stroke={gold} strokeWidth="1.5" />
      <polygon points="16,8 24,12 24,20 16,24 8,20 8,12"  fill={gold} opacity="0.2" />
      <line x1="16" y1="2"  x2="16" y2="30" stroke={gold} strokeWidth="1"   opacity="0.45" />
      <line x1="2"  y1="9"  x2="30" y2="23" stroke={gold} strokeWidth="1"   opacity="0.45" />
      <line x1="30" y1="9"  x2="2"  y2="23" stroke={gold} strokeWidth="1"   opacity="0.45" />
    </svg>
  )
}
