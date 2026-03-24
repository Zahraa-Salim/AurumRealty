import 'server-only'

import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { randomUUID } from 'crypto'
import { mkdir, writeFile } from 'fs/promises'
import path from 'path'

export const VALID_IMAGE_TYPES: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
}

const DEFAULT_MAX_SIZE_BYTES = 10 * 1024 * 1024

type UploadStorageDriver = 'local' | 's3'

type UploadResult = {
  url: string
  filename: string
  storage: UploadStorageDriver
}

let cachedS3Client: S3Client | null = null

function getUploadDriver(): UploadStorageDriver {
  const configured = process.env.UPLOAD_STORAGE?.toLowerCase()

  if (configured === 's3') return 's3'
  if (configured === 'local') return 'local'

  return process.env.NODE_ENV === 'production' && process.env.S3_BUCKET ? 's3' : 'local'
}

function getMaxUploadSizeBytes() {
  const configuredMb = Number(process.env.UPLOAD_MAX_SIZE_MB ?? '10')

  if (!Number.isFinite(configuredMb) || configuredMb <= 0) {
    return DEFAULT_MAX_SIZE_BYTES
  }

  return configuredMb * 1024 * 1024
}

function buildFilename(file: File) {
  const ext = VALID_IMAGE_TYPES[file.type]
  if (!ext) {
    throw new Error('Invalid file type. Only JPEG, PNG, WebP and GIF are supported.')
  }

  return `${Date.now()}-${randomUUID()}${ext}`
}

function buildObjectKey(filename: string) {
  const prefix = process.env.S3_PREFIX?.trim().replace(/^\/+|\/+$/g, '')
  return prefix ? `${prefix}/${filename}` : filename
}

function buildPublicUrl(baseUrl: string, key: string) {
  const normalizedBase = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`
  return new URL(key, normalizedBase).toString()
}

function getS3Client() {
  if (cachedS3Client) return cachedS3Client

  const region = process.env.S3_REGION
  const accessKeyId = process.env.S3_ACCESS_KEY_ID
  const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY

  if (!region || !accessKeyId || !secretAccessKey) {
    throw new Error('Missing S3_REGION, S3_ACCESS_KEY_ID or S3_SECRET_ACCESS_KEY.')
  }

  cachedS3Client = new S3Client({
    region,
    endpoint: process.env.S3_ENDPOINT || undefined,
    forcePathStyle: process.env.S3_FORCE_PATH_STYLE === 'true',
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  })

  return cachedS3Client
}

async function uploadToLocal(file: File, filename: string): Promise<UploadResult> {
  const uploadDir = path.join(process.cwd(), 'public', 'uploads')
  await mkdir(uploadDir, { recursive: true })

  const filePath = path.join(uploadDir, filename)
  const buffer = Buffer.from(await file.arrayBuffer())

  await writeFile(filePath, buffer)

  return {
    url: `/uploads/${filename}`,
    filename,
    storage: 'local',
  }
}

async function uploadToS3(file: File, filename: string): Promise<UploadResult> {
  const bucket = process.env.S3_BUCKET
  const publicUrl = process.env.S3_PUBLIC_URL

  if (!bucket || !publicUrl) {
    throw new Error('Missing S3_BUCKET or S3_PUBLIC_URL for production uploads.')
  }

  const key = buildObjectKey(filename)
  const client = getS3Client()
  const buffer = Buffer.from(await file.arrayBuffer())

  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: buffer,
      ContentType: file.type,
      CacheControl: 'public, max-age=31536000, immutable',
    })
  )

  return {
    url: buildPublicUrl(publicUrl, key),
    filename,
    storage: 's3',
  }
}

export async function uploadImageFile(file: File): Promise<UploadResult> {
  const maxSize = getMaxUploadSizeBytes()

  if (!VALID_IMAGE_TYPES[file.type]) {
    throw new Error('Invalid file type. Only JPEG, PNG, WebP and GIF are supported.')
  }

  if (file.size > maxSize) {
    const maxSizeMb = Math.round(maxSize / (1024 * 1024))
    throw new Error(`File too large. Maximum size is ${maxSizeMb} MB.`)
  }

  const filename = buildFilename(file)
  const driver = getUploadDriver()

  if (driver === 's3') {
    return uploadToS3(file, filename)
  }

  return uploadToLocal(file, filename)
}
