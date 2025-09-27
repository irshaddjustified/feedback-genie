// Legacy NextAuth configuration - kept for compatibility but using Firebase auth
// import type { NextAuthOptions } from 'next-auth'

// Define NextAuthOptions type locally to avoid import issues
interface NextAuthOptions {
  providers: any[]
  session: {
    strategy: 'jwt' | 'database'
  }
  callbacks?: {
    jwt?: (params: any) => Promise<any>
    session?: (params: any) => Promise<any>
  }
  pages?: {
    signIn?: string
    error?: string
  }
}

// Define minimal types for compatibility
interface NextAuthSession {
  user: {
    id: string
    email: string
    name?: string
    role?: string
  }
}

interface NextAuthJWT {
  role?: string
  sub?: string
  email?: string
  name?: string
}

// Minimal NextAuth config since we're using Firebase auth primarily
export const authOptions: NextAuthOptions = {
  providers: [
    // NextAuth providers disabled - using Firebase auth instead
  ],
  session: {
    strategy: 'jwt'
  },
  callbacks: {
    async jwt({ token, user }: { token: NextAuthJWT; user: any }) {
      // Minimal JWT handling since Firebase manages auth
      if (user) {
        token.role = 'user'
      }
      return token
    },
    async session({ session, token }: { session: NextAuthSession; token: NextAuthJWT }): Promise<NextAuthSession> {
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
