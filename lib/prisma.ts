/**
 * lib/prisma.ts
 * Prisma client singleton — prevents too many DB connections in development.
 * Uses standard PrismaClient with DATABASE_URL from .env
 * No Neon adapter needed — Prisma connects to Neon via standard PostgreSQL TCP.
 */

import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma
