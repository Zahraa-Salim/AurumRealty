/**
 * lib/locale-server.ts
 *
 * Server-side locale resolution for Next.js App Router server components.
 * Reads the `locale` cookie from the incoming request.
 *
 * Usage in any server component:
 *   import { getServerLocale } from '@/lib/locale-server'
 *   const locale = await getServerLocale()
 */

import 'server-only'
import { cookies } from 'next/headers'
import type { Locale } from '@/lib/i18n'

export async function getServerLocale(): Promise<Locale> {
  const cookieStore = await cookies()
  const val = cookieStore.get('locale')?.value
  return val === 'ar' ? 'ar' : 'en'
}
