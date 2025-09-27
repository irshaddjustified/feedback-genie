import type { Session } from 'next-auth'
import { getServerSession } from 'next-auth/next'
import { authOptions } from './auth'
import { database } from './prisma'

type CreateContextOptions = {
  session: Session | null
}

const createInnerContext = (opts: CreateContextOptions) => {
  return {
    session: opts.session,
    database,
  }
}

// Context creator for API routes (no longer tRPC-specific)
export const createContext = async (req?: Request) => {
  try {
    // Get the session from the server using the getServerSession wrapper function
    const session = await getServerSession(authOptions)

    return createInnerContext({
      session,
    })
  } catch (error) {
    // Handle case where session retrieval fails
    console.error('Error getting session:', error)
    return createInnerContext({
      session: null,
    })
  }
}

export type Context = Awaited<ReturnType<typeof createContext>>
