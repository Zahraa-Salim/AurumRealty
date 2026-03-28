'use client'

import React, { useEffect, useRef } from 'react'

type Props = {
  src: string
  alt: string
}

/**
 * HomeParallaxImage — moves at 30% of scroll speed, creating depth.
 * Wraps in overflow-hidden container; image is 120% height to allow travel room.
 * Uses a passive scroll listener for performance.
 */
export function HomeParallaxImage({ src, alt }: Props) {
  const imgRef = useRef<HTMLImageElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const img = imgRef.current
    const container = containerRef.current
    if (!img || !container) return

    let rafId: number | null = null

    const onScroll = () => {
      if (rafId !== null) return
      rafId = requestAnimationFrame(() => {
        rafId = null
        const rect = container.getBoundingClientRect()
        const windowH = window.innerHeight
        // Only animate when section is in view
        if (rect.bottom < 0 || rect.top > windowH) return
        // Progress from 0 (entering bottom) to 1 (leaving top)
        const progress = 1 - (rect.bottom / (windowH + rect.height))
        // Shift image ±10% of container height
        const shift = (progress - 0.5) * 20
        img.style.transform = `translateY(${shift}%)`
      })
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll() // initialise on mount

    return () => {
      window.removeEventListener('scroll', onScroll)
      if (rafId !== null) cancelAnimationFrame(rafId)
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className="w-full md:w-1/2 overflow-hidden rounded-sm"
      style={{ height: '440px' }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        style={{
          width: '100%',
          height: '120%',
          objectFit: 'cover',
          willChange: 'transform',
          transition: 'transform 0.1s linear',
          marginTop: '-10%',
        }}
      />
    </div>
  )
}
