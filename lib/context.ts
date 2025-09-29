import { authService, AppUser, convertFirebaseUser } from './firebase'
import { adminAuth } from './firebase-admin'

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
    if (!req) {
      return createInnerContext({ user: null })
    }

    // Check for Authorization header
    const authHeader = req.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')

    if (!token) {
      return createInnerContext({ user: null })
    }

    try {
      // Verify the Firebase ID token using Firebase Admin
      const decodedToken = await adminAuth.verifyIdToken(token)

      // Convert the decoded token to our AppUser format
      const mockFirebaseUser = {
        uid: decodedToken.uid,
        email: decodedToken.email || null,
        displayName: decodedToken.name || null,
        emailVerified: decodedToken.email_verified || false,
        isAnonymous: false
      }

      const user = await convertFirebaseUser(mockFirebaseUser as any)

      return createInnerContext({ user })
    } catch (tokenError) {
      console.error('Error verifying Firebase token:', tokenError)
      return createInnerContext({ user: null })
    }
  } catch (error) {
    // Handle case where auth retrieval fails
    console.error('Error creating context:', error)
    return createInnerContext({
      user: null,
    })
  }
}

export type Context = Awaited<ReturnType<typeof createContext>>
