import fs from 'fs'
import path from 'path'

const cwd = process.cwd()
const args = new Set(process.argv.slice(2))
const isProductionCheck = args.has('--production')

function loadEnvFile(filename) {
  const filePath = path.join(cwd, filename)
  if (!fs.existsSync(filePath)) return {}

  const content = fs.readFileSync(filePath, 'utf8')
  const entries = {}

  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim()
    if (!line || line.startsWith('#')) continue

    const separatorIndex = line.indexOf('=')
    if (separatorIndex === -1) continue

    const key = line.slice(0, separatorIndex).trim()
    let value = line.slice(separatorIndex + 1).trim()

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }

    entries[key] = value
  }

  return entries
}

const mergedEnv = {
  ...loadEnvFile('.env'),
  ...loadEnvFile('.env.local'),
  ...process.env,
}

const errors = []
const warnings = []
const checks = []

function readEnv(name) {
  const value = mergedEnv[name]
  return typeof value === 'string' ? value.trim() : ''
}

function requireEnv(name, label = name) {
  const value = readEnv(name)
  checks.push({ name, present: Boolean(value) })
  if (!value) {
    errors.push(`Missing ${label}`)
  }
  return value
}

function warn(message) {
  warnings.push(message)
}

const databaseUrl = requireEnv('DATABASE_URL')
const nextAuthSecret = requireEnv('NEXTAUTH_SECRET')
const nextAuthUrl = requireEnv('NEXTAUTH_URL')
const uploadStorage = readEnv('UPLOAD_STORAGE') || 'local'
const resendApiKey = readEnv('RESEND_API_KEY')
const resendFromEmail = readEnv('RESEND_FROM_EMAIL')

if (nextAuthUrl && isProductionCheck && /localhost|127\.0\.0\.1/i.test(nextAuthUrl)) {
  errors.push('NEXTAUTH_URL still points to localhost for a production check')
}

if (nextAuthSecret && nextAuthSecret.length < 32) {
  warn('NEXTAUTH_SECRET looks shorter than recommended')
}

if (!databaseUrl.includes('sslmode=require')) {
  warn('DATABASE_URL does not include sslmode=require')
}

if (uploadStorage === 's3') {
  requireEnv('S3_REGION')
  requireEnv('S3_BUCKET')
  requireEnv('S3_ACCESS_KEY_ID')
  requireEnv('S3_SECRET_ACCESS_KEY')
  requireEnv('S3_PUBLIC_URL')

  if (!readEnv('S3_ENDPOINT')) {
    warn('S3_ENDPOINT is empty; this is fine for AWS S3, but required for providers like Cloudflare R2')
  }
} else if (isProductionCheck) {
  warn('UPLOAD_STORAGE is not set to "s3"; production uploads will use local disk')
}

if (resendApiKey || resendFromEmail) {
  requireEnv('RESEND_API_KEY')
  requireEnv('RESEND_FROM_EMAIL')

  const recipients =
    readEnv('RESEND_NOTIFICATION_TO') ||
    readEnv('CONTACT_NOTIFICATION_TO') ||
    readEnv('SHOWINGS_NOTIFICATION_TO')

  if (!recipients) {
    warn('Resend is configured but no notification recipient env var is set')
  }
} else {
  warn('Resend notifications are not configured')
}

console.log('Aurum Realty launch check')
console.log(`Mode: ${isProductionCheck ? 'production' : 'local/default'}`)
console.log(`Upload driver: ${uploadStorage}`)

if (errors.length === 0) {
  console.log('Status: OK')
} else {
  console.log('Status: FAILED')
}

if (errors.length > 0) {
  console.log('\nErrors:')
  for (const error of errors) {
    console.log(`- ${error}`)
  }
}

if (warnings.length > 0) {
  console.log('\nWarnings:')
  for (const warning of warnings) {
    console.log(`- ${warning}`)
  }
}

console.log('\nChecked:')
for (const check of checks) {
  console.log(`- ${check.name}: ${check.present ? 'set' : 'missing'}`)
}

process.exit(errors.length > 0 ? 1 : 0)
