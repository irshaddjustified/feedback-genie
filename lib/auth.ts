import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { JWT } from 'next-auth/jwt'
import { Session } from 'next-auth'

// Extend the types
declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name?: string
      role?: string
    }
  }
  
  interface User {
    id: string
    email: string
    name?: string
    role?: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role?: string
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            throw new Error('Missing credentials')
          }

          // For MVP, we'll use hardcoded admin credentials
          // In production, this should check against a user table with bcrypt
          const adminEmail = process.env.ADMIN_EMAIL || 'admin@insighture.com'
          const adminPassword = process.env.ADMIN_PASSWORD || 'admin123'

          // Normalize email to lowercase for comparison
          const normalizedEmail = credentials.email.toLowerCase().trim()
          const normalizedAdminEmail = adminEmail.toLowerCase().trim()

          if (normalizedEmail === normalizedAdminEmail && credentials.password === adminPassword) {
            return {
              id: '1',
              email: adminEmail,
              name: 'Admin User',
              role: 'admin'
            }
          }

          // Return null for invalid credentials (this will trigger an error)
          return null
        } catch (error) {
          console.error('Authentication error:', error)
          return null
        }
      }
    })
  ],
  session: {
    strategy: 'jwt'
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
      }
      return token
    },
    async session({ session, token }): Promise<Session> {
      if (session.user) {
        session.user.id = token.sub ?? '';
        session.user.role = token.role ?? 'user';
        session.user.email = token.email ?? '';
        session.user.name = token.name ?? '';
      }
      return session
    }
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/error'
  }
}
