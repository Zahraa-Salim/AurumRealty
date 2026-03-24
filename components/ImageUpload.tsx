'use client'

import React, { useRef, useState, useCallback } from 'react'

interface ImageUploadProps {
  value?: string | null
  onChange: (url: string) => void
  label?: string
  hint?: string
  aspectClass?: string
}

export default function ImageUpload({
  value,
  onChange,
  label = 'Image',
  hint = 'Choose an image file or paste an image URL.',
  aspectClass = 'aspect-video',
}: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [manualUrl, setManualUrl] = useState(value ?? '')

  const upload = useCallback(async (file: File) => {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!validTypes.includes(file.type)) {
      setError('Only JPEG, PNG, WebP and GIF files are supported.')
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('File is too large. Maximum size is 10 MB.')
      return
    }

    setError('')
    setUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        throw new Error(data.error || 'Upload failed.')
      }

      setManualUrl(data.url ?? '')
      onChange(data.url)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Upload failed. Please try again.')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }, [onChange])

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return
    void upload(files[0])
  }

  const applyManualUrl = () => {
    const trimmed = manualUrl.trim()
    if (!trimmed) {
      setError('Enter an image URL first.')
      return
    }

    setError('')
    onChange(trimmed)
  }

  const clearImage = () => {
    setManualUrl('')
    setError('')
    onChange('')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <div className="flex flex-col gap-3">
      {label && (
        <label className="font-sans text-[13px] font-medium text-charcoal">{label}</label>
      )}

      <div
        className={`relative w-full ${aspectClass} border border-light-gray rounded-sm overflow-hidden bg-light-gray/10`}
        style={{ borderWidth: '0.5px' }}
      >
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value} alt="Preview" className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-6 text-center">
            <UploadIcon />
            <p className="font-sans text-[13px] text-taupe">{hint}</p>
            <p className="font-sans text-[11px] text-mid-gray">JPEG, PNG, WebP or GIF up to 10 MB</p>
          </div>
        )}

        {uploading && (
          <div className="absolute inset-0 bg-white/90 flex items-center justify-center">
            <p className="font-sans text-[12px] text-taupe">Uploading image…</p>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-start">
        <div className="flex-1">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={e => handleFiles(e.target.files)}
            className="block w-full font-sans text-[13px] text-charcoal file:mr-4 file:rounded-full file:border-0 file:bg-gold file:px-4 file:py-2 file:font-sans file:text-[13px] file:font-medium file:text-charcoal hover:file:bg-gold-dark"
          />
        </div>

        <div className="flex-1 flex flex-col gap-2">
          <input
            type="url"
            value={manualUrl}
            onChange={e => setManualUrl(e.target.value)}
            placeholder="Or paste an image URL"
            className="w-full h-[44px] px-4 font-sans text-[14px] text-charcoal bg-white border border-light-gray rounded-sm focus:outline-none focus:border-charcoal"
            style={{ borderWidth: '0.5px' }}
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={applyManualUrl}
              className="px-4 py-2 rounded-full font-sans text-[13px] font-medium text-charcoal bg-white border border-charcoal hover:bg-light-gray/20 transition-colors"
              style={{ borderWidth: '0.5px' }}
            >
              Use URL
            </button>
            {value && (
              <button
                type="button"
                onClick={clearImage}
                className="px-4 py-2 rounded-full font-sans text-[13px] font-medium text-taupe bg-transparent border-none hover:text-error transition-colors"
              >
                Remove image
              </button>
            )}
          </div>
        </div>
      </div>

      {error && <p className="font-sans text-[12px] text-error">{error}</p>}
    </div>
  )
}

function UploadIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M16 21V11M16 11L12 15M16 11L20 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-taupe" />
      <path d="M8 23H24" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-light-gray" />
    </svg>
  )
}
