'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Shield, Home, LogIn, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/lib/contexts/AuthContext'

export default function UnauthorizedPage() {
  const { user, signOut } = useAuth()

  const handleSignOut = async () => {
    try {
      await signOut()
      window.location.href = '/auth/login'
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-100">
      <Card className="max-w-lg w-full">
        <CardHeader className="text-center">
          <Shield className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <CardTitle className="text-2xl">Access Denied</CardTitle>
          <CardDescription className="text-base">
            You don't have permission to access this resource
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h3 className="font-semibold text-red-800 mb-2">Administrator Access Required</h3>
            <p className="text-sm text-red-700">
              The page you're trying to access requires administrator privileges. 
              {user?.isAnonymous && " Anonymous users cannot access admin areas."}
            </p>
            {user && (
              <div className="mt-3 text-xs text-red-600">
                <strong>Current user:</strong> {user.displayName || user.email || 'Anonymous User'}
                <br />
                <strong>Role:</strong> {user.role}
                <br />
                <strong>Anonymous:</strong> {user.isAnonymous ? 'Yes' : 'No'}
              </div>
            )}
          </div>

          <div className="space-y-3">
            <div className="text-sm text-muted-foreground">
              <strong>What you can do:</strong>
            </div>
            <ul className="text-sm text-muted-foreground space-y-1 ml-4">
              <li>• Contact your administrator for access</li>
              <li>• Sign in with an administrator account</li>
              <li>• Return to the public areas of the site</li>
            </ul>
          </div>

          <div className="flex flex-col space-y-3">
            <Button asChild className="w-full">
              <Link href="/">
                <Home className="h-4 w-4 mr-2" />
                Return to Home
              </Link>
            </Button>
            
            {user ? (
              <Button variant="outline" onClick={handleSignOut} className="w-full">
                <LogIn className="h-4 w-4 mr-2" />
                Sign In with Different Account
              </Button>
            ) : (
              <Button variant="outline" asChild className="w-full">
                <Link href="/auth/login">
                  <LogIn className="h-4 w-4 mr-2" />
                  Sign In
                </Link>
              </Button>
            )}
            
            <Button variant="ghost" onClick={() => window.history.back()} className="w-full">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
