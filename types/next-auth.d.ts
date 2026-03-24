import 'next-auth'
import 'next-auth/jwt'

declare module 'next-auth' {
  interface User {
    id: string
    role?: string
    roleId?: number | null
    permissions?: string[]
    permissionsVersion?: number
  }
  interface Session {
    user: {
      id: string
      name: string | null
      email: string | null
      role?: string
      roleId?: number | null
      permissions?: string[]
      permissionsVersion?: number
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role?: string
    roleId?: number | null
    permissions?: string[]
    permissionsVersion?: number
  }
}
