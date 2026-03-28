'use client'

import React, { useEffect, useRef, useState } from 'react'

type Stat = {
  label: string
  value: number
  suffix: string
  prefix?: string
}

function useCountUp(target: number, duration = 1400, active: boolean) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!active) return
    const start = performance.now()

    const tick = (now: number) => {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.round(eased * target))
      if (progress < 1) requestAnimationFrame(tick)
    }

    requestAnimationFrame(tick)
  }, [active, target, duration])

  return count
}

function StatItem({ stat, active }: { stat: Stat; active: boolean }) {
  const count = useCountUp(stat.value, 1400, active)
  return (
    <div className="text-center px-8 py-2">
      <p className="font-serif text-[40px] md:text-[48px] text-charcoal leading-none mb-2 stat-animate" style={{ animationDelay: '0.1s' }}>
        {stat.prefix ?? ''}{count.toLocaleString()}{stat.suffix}
      </p>
      <p className="font-sans text-[13px] uppercase tracking-widest text-taupe">{stat.label}</p>
    </div>
  )
}

type Props = {
  propertyCount: number
}

export function HomeStatsBar({ propertyCount }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(false)

  const stats: Stat[] = [
    { label: 'Properties listed', value: propertyCount || 120, suffix: '+' },
    { label: 'Years established', value: new Date().getFullYear() - 2010, suffix: '' },
    { label: 'Transactions completed', value: 340, suffix: '+' },
    { label: 'Markets served', value: 12, suffix: '' },
  ]

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setActive(true)
          observer.disconnect()
        }
      },
      { threshold: 0.3 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <section
      ref={ref}
      className="bg-charcoal py-14 px-4 md:px-8"
    >
      <div className="max-w-[1200px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 divide-x divide-white/10">
        {stats.map((stat) => (
          <StatItem key={stat.label} stat={stat} active={active} />
        ))}
      </div>
    </section>
  )
}
