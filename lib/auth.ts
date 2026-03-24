import type { Session, User } from 'next-auth'
import type { JWT } from 'next-auth/jwt'
import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { extractPermissionKeys, getAssignedRoleName, getUserWithPermissionsByEmail } from '@/lib/rbac-server'

type AuthorizedUser = User & {
  id: string
  role: string
  roleId: number | null
  permissions: string[]
  permissionsVersion: number
}

type SessionUser = Session['user']
type TokenWithRbac = JWT & {
  id?: string
  role?: string
  roleId?: number | null
  permissions?: string[]
  permissionsVersion?: number
}

function getTokenPermissions(token: TokenWithRbac) {
  return Array.isArray(token.permissions) ? token.permissions : []
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email:    { label: 'Email',    type: 'email'    },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const user = await getUserWithPermissionsByEmail(credentials.email)

        if (!user || !user.isActive) return null

        const passwordMatch = await bcrypt.compare(credentials.password, user.password)
        if (!passwordMatch) return null

        await prisma.user.update({
          where: { id: user.id },
          data: { lastActive: new Date() },
        })

        const permissions = extractPermissionKeys(user.assignedRole)
        const roleName = getAssignedRoleName(user)
        const authorizedUser: AuthorizedUser = {
          id: String(user.id),
          name: user.name,
          email: user.email,
          role: roleName,
          roleId: user.roleId,
          permissions,
          permissionsVersion: user.permissionsVersion,
        }

        return authorizedUser
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      const rbacToken = token as TokenWithRbac

      if (user) {
        const authorizedUser = user as AuthorizedUser
        rbacToken.id = authorizedUser.id
        rbacToken.role = authorizedUser.role
        rbacToken.roleId = authorizedUser.roleId
        rbacToken.permissions = authorizedUser.permissions
        rbacToken.permissionsVersion = authorizedUser.permissionsVersion
      }

      return rbacToken
    },
    async session({ session, token }) {
      const rbacToken = token as TokenWithRbac

      if (session.user) {
        const sessionUser = session.user as SessionUser
        sessionUser.id = String(rbacToken.id ?? '')
        sessionUser.role = rbacToken.role
        sessionUser.roleId = rbacToken.roleId ?? null
        sessionUser.permissions = getTokenPermissions(rbacToken)
        sessionUser.permissionsVersion = rbacToken.permissionsVersion
      }

      return session
    },
  },

  pages: {
    signIn: '/login',
    error:  '/login',
  },

  session: {
    strategy:   'jwt',
    maxAge:     8 * 60 * 60, // 8 hours
  },

  secret: process.env.NEXTAUTH_SECRET,
}
