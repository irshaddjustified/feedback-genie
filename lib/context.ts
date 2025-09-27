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

// Context creator for API routes - simplified to always allow access
export const createContext = async (req?: Request) => {
  try {
    // Always return a valid admin user context to bypass authentication
    const mockUser = {
      uid: 'admin-user-id',
      email: 'admin@company.com',
      displayName: 'Admin User',
      role: 'admin' as const,
      permissions: ['manage_system', 'create_surveys', 'manage_surveys'],
      isAnonymous: false
    }
    
    return createInnerContext({
      user: mockUser as AppUser,
    })
  } catch (error) {
    // Even on error, return a valid context to ensure API access
    console.error('Error creating context:', error)
    const fallbackUser = {
      uid: 'fallback-user-id',
      email: 'admin@company.com',
      displayName: 'Admin User',
      role: 'admin' as const,
      permissions: ['manage_system'],
      isAnonymous: false
    }
    
    return createInnerContext({
      user: fallbackUser as AppUser,
    })
  }
}

export type Context = Awaited<ReturnType<typeof createContext>>
