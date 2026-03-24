import { NextRequest, NextResponse } from 'next/server'
import { requireApiPermissions } from '@/lib/api-auth'
import { uploadImageFile } from '@/lib/upload-storage'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  const auth = await requireApiPermissions([
    'properties.create',
    'properties.edit',
    'blog.create',
    'blog.edit',
    'news.create',
    'news.edit',
    'pages.edit',
    'settings.edit',
  ])
  if (auth.response) return auth.response

  try {
    const formData = await req.formData()
    const file = formData.get('file')

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'No file provided.' }, { status: 400 })
    }

    const uploaded = await uploadImageFile(file)

    return NextResponse.json({
      url: uploaded.url,
      filename: uploaded.filename,
      storage: uploaded.storage,
    })
  } catch (error) {
    console.error('POST /api/upload error:', error)
    const message = error instanceof Error ? error.message : 'Failed to upload image.'
    const status = message.startsWith('Invalid file type') || message.startsWith('File too large') ? 400 : 500

    return NextResponse.json({ error: message }, { status })
  }
}
