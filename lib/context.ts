import { authService, AppUser } from './firebase'

type CreateContextOptions = {
  user: AppUser | null
}

const createInnerContext = (opts: CreateContextOptions) => {
  return {
    user: opts.user,
    session: opts.user ? {
      user: {
        id: opts.user.uid,
        email: opts.user.email,
        name: opts.user.displayName || '',
        role: opts.user.role
      }
    } : null
  }
}

// Context creator for API routes using Firebase auth
export const createContext = async (req?: Request) => {
  try {
    // Get the current user from Firebase auth
    const user = await authService.getCurrentUser()

    return createInnerContext({
      user,
    })
  } catch (error) {
    // Handle case where auth retrieval fails
    console.error('Error getting user:', error)
    return createInnerContext({
      user: null,
    })
  }
}

export type Context = Awaited<ReturnType<typeof createContext>>
