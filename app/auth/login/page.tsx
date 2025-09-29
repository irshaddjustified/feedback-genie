'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, Eye, Copy, ExternalLink, Crown, Shield, Users } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { toast } from 'sonner'
import { useAuth } from '@/lib/contexts/AuthContext'
import { authService, DEMO_CREDENTIALS } from '@/lib/firebase'
import Link from 'next/link'


const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters')
})

type LoginSchema = z.infer<typeof loginSchema>

export default function AdminLoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { user, loading } = useAuth()
  
  const form = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  })

  // Redirect if already logged in with admin role
  useEffect(() => {
    if (user && authService.isAdmin(user)) {
      router.push('/admin/dashboard')
    }
  }, [user, router])

  // Show loading while checking authentication status
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin" />
          <p className="mt-2 text-sm text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Redirect if already authenticated with admin privileges
  if (user && authService.isAdmin(user)) {
    return null
  }


  const handleEmailLogin = async (data: LoginSchema) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const user = await authService.signInWithEmail(data.email, data.password)
      
      if (user) {
        if (authService.isAdmin(user)) {
          toast.success('Welcome back!')
          router.push('/admin/dashboard')
        } else {
          setError('Access denied. Only admin accounts can access this portal.')
          toast.error('Access denied')
        }
      }
    } catch (error: any) {
      console.error('Login error:', error)
      let errorMessage = 'Invalid email or password.'
      
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email address.'
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Invalid password.'
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address.'
      }
      
      setError(errorMessage)
      toast.error('Login failed')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    try {
      setIsGoogleLoading(true)
      setError(null)
      
      const user = await authService.signInWithGoogle()
      
      if (user) {
        // Check if user has admin privileges
        if (authService.isAdmin(user)) {
          toast.success('Welcome to the admin portal!')
          router.push('/admin/dashboard')
        } else {
          // Sign out non-admin users
          await authService.signOut()
          setError('Access denied. Only authorized accounts can access the admin portal.')
          toast.error('Access denied')
        }
      }
    } catch (err: any) {
      console.error('Google sign-in error:', err)
      let errorMessage = 'An unexpected error occurred. Please try again.'
      
      if (err.code === 'auth/popup-closed-by-user') {
        errorMessage = 'Sign-in was cancelled.'
      } else if (err.code === 'auth/popup-blocked') {
        errorMessage = 'Pop-up was blocked. Please allow pop-ups and try again.'
      } else if (err.code === 'auth/account-exists-with-different-credential') {
        errorMessage = 'An account already exists with a different sign-in method.'
      }
      
      setError(errorMessage)
      toast.error('Sign-in failed')
    } finally {
      setIsGoogleLoading(false)
    }
  }


  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Admin Portal
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to manage feedback surveys and analytics
          </p>
        </div>
        
        <Card className="mt-8">
          <CardHeader className='text-center'>
            <CardTitle>Admin Portal Sign In</CardTitle>
            <CardDescription>
              Sign in with super admin credentials or authorized Google account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Google Sign-in */}
              <Button 
                onClick={handleGoogleSignIn}
                variant="outline"
                className="w-full"
                disabled={isGoogleLoading}
              >
                {isGoogleLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                      <path fill="#4285f4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34a853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#fbbc05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#ea4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Continue with Google
                  </>
                )}
              </Button>
              
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
