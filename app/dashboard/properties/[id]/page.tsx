import React from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { StatusBadge } from '@/components/dashboard/DashboardShared'

const statusVariant = (status: string): 'gold' | 'cream' | 'green' | 'gray' => {
  if (status === 'For Sale') return 'gold'
  if (status === 'For Rent') return 'cream'
  if (status === 'New Development') return 'green'
  return 'gray'
}

const formatBathrooms = (value: number) =>
  Number.isInteger(value) ? String(value) : value.toString()

export default async function DashboardPropertyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const numericId = Number(id)

  if (!Number.isInteger(numericId) || numericId <= 0) {
    notFound()
  }

  const property = await prisma.property.findUnique({
    where: { id: numericId },
  })

  if (!property) {
    notFound()
  }

  const showingCount = await prisma.showing.count({
    where: { propertyId: property.id, type: 'showing' },
  })

  const images = property.images.length > 0
    ? property.images
    : ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80']

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <Link href="/dashboard/properties" className="flex items-center gap-2 font-sans text-[13px] text-taupe hover:text-charcoal no-underline transition-colors">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
          All properties
        </Link>
        <Link href={`/dashboard/properties/edit/${property.id}`} className="bg-gold hover:bg-gold-dark text-charcoal font-sans text-[13px] font-medium px-6 py-2.5 rounded-full transition-colors no-underline">
          Edit property
        </Link>
      </div>

      <div className="rounded-sm overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={images[0]} alt={property.title} className="w-full h-[300px] object-cover" />
      </div>

      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto">
          {images.slice(1).map((image, index) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={`${image}-${index}`} src={image} alt={`Gallery ${index + 1}`} className="h-[80px] aspect-[3/2] object-cover rounded-sm flex-shrink-0" />
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-light-gray rounded-sm p-6" style={{ borderWidth: '0.5px' }}>
            <div className="flex items-start justify-between gap-4 mb-3">
              <h1 className="font-serif text-[28px] text-charcoal leading-[1.2]">{property.title}</h1>
              <StatusBadge status={property.status} variant={statusVariant(property.status)} />
            </div>
            <p className="font-sans text-[22px] font-medium text-gold mb-1">{property.price}</p>
            <p className="font-sans text-[14px] text-taupe italic">
              {[property.address, property.neighbourhood].filter(Boolean).join(', ') || 'Location not set'}
            </p>
          </div>

          <div className="bg-white border border-light-gray rounded-sm p-6" style={{ borderWidth: '0.5px' }}>
            <h2 className="font-serif text-[16px] text-charcoal mb-4">Description</h2>
            <p className="font-sans text-[14px] text-taupe leading-[1.7]">
              {property.description || 'No description available yet.'}
            </p>
          </div>

          <div className="bg-white border border-light-gray rounded-sm p-6" style={{ borderWidth: '0.5px' }}>
            <h2 className="font-serif text-[16px] text-charcoal mb-4">Features</h2>
            {property.features.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {property.features.map(feature => (
                  <span key={feature} className="px-3 py-1.5 bg-cream text-charcoal font-sans text-[13px] rounded-sm">
                    {feature}
                  </span>
                ))}
              </div>
            ) : (
              <p className="font-sans text-[14px] text-taupe">No features added yet.</p>
            )}
          </div>
        </div>

        <div className="space-y-5">
          <div className="bg-white border border-light-gray rounded-sm p-6" style={{ borderWidth: '0.5px' }}>
            <h2 className="font-serif text-[16px] text-charcoal mb-5">Key details</h2>
            <div className="space-y-3">
              {[
                ['Type', property.type],
                ['Bedrooms', String(property.bedrooms)],
                ['Bathrooms', formatBathrooms(property.bathrooms)],
                ['Area', property.area || '—'],
                ['Year built', property.yearBuilt || '—'],
                ['Lot size', property.lotSize || '—'],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between items-center pb-3 border-b border-light-gray last:border-0 last:pb-0" style={{ borderWidth: '0 0 0.5px 0' }}>
                  <span className="font-sans text-[12px] text-taupe">{label}</span>
                  <span className="font-sans text-[14px] font-medium text-charcoal">{value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-cream border border-light-gray rounded-sm p-5" style={{ borderWidth: '0.5px' }}>
            <p className="font-sans text-[11px] font-medium text-taupe uppercase tracking-wider mb-3">Listing agent</p>
            <p className="font-serif text-[14px] text-charcoal">{property.agentName || 'Not assigned'}</p>
          </div>

          <Link href="/dashboard/showings" className="block bg-white border border-light-gray rounded-sm p-5 no-underline hover:border-charcoal/30 transition-colors" style={{ borderWidth: '0.5px' }}>
            <p className="font-sans text-[11px] font-medium text-taupe uppercase tracking-wider mb-2">Showing requests</p>
            <p className="font-sans text-[28px] font-medium text-charcoal">{showingCount}</p>
            <p className="font-sans text-[12px] text-taupe mt-1">View all showings →</p>
          </Link>
        </div>
      </div>
    </div>
  )
}
