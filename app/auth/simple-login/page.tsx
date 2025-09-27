'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { toast } from 'sonner'

// Hardcoded admin credentials
const ADMIN_CREDENTIALS: Record<string, string> = {
  'admin@company.com': 'admin123',
  'demo@insighture.com': 'demo123',
  'owner@company.com': 'owner123'
}

export default function SimpleLoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [email, setEmail] = useState('admin@company.com')
  const [password, setPassword] = useState('admin123')
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      // Simple credential validation
      const trimmedEmail = email.toLowerCase().trim()
      
      if (!ADMIN_CREDENTIALS[trimmedEmail]) {
        throw new Error('Invalid email address')
      }
      
      if (ADMIN_CREDENTIALS[trimmedEmail] !== password) {
        throw new Error('Invalid password')
      }

      // Store simple session
      localStorage.setItem('admin-session', JSON.stringify({
        email: trimmedEmail,
        role: 'admin',
        loginTime: Date.now()
      }))

      toast.success('Login successful!')
      router.push('/admin/dashboard')
      
    } catch (error: any) {
      setError(error.message || 'Login failed')
      toast.error('Login failed')
    } finally {
      setIsLoading(false)
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
          <CardHeader>
            <CardTitle>Admin Login</CardTitle>
            <CardDescription>
              Enter your admin credentials to access the portal
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              {/* Email/Password Form */}
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@company.com"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? 'Signing in...' : 'Sign In'}
                </Button>
              </form>

              {/* Demo Credentials */}
              <div className="mt-6 pt-6 border-t">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Demo Credentials:</h3>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between p-2 bg-blue-50 rounded border">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Admin:</span>
                      <code className="bg-white px-1 rounded">admin@company.com</code>
                      <span>/</span>
                      <code className="bg-white px-1 rounded">admin123</code>
                    </div>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      className="h-6 px-2"
                      onClick={() => {
                        setEmail('admin@company.com')
                        setPassword('admin123')
                        toast.success('Credentials filled!')
                      }}
                    >
                      Fill
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between p-2 bg-purple-50 rounded border">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Super Admin:</span>
                      <code className="bg-white px-1 rounded">demo@insighture.com</code>
                      <span>/</span>
                      <code className="bg-white px-1 rounded">demo123</code>
                    </div>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      className="h-6 px-2"
                      onClick={() => {
                        setEmail('demo@insighture.com')
                        setPassword('demo123')
                        toast.success('Credentials filled!')
                      }}
                    >
                      Fill
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between p-2 bg-green-50 rounded border">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Owner:</span>
                      <code className="bg-white px-1 rounded">owner@company.com</code>
                      <span>/</span>
                      <code className="bg-white px-1 rounded">owner123</code>
                    </div>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      className="h-6 px-2"
                      onClick={() => {
                        setEmail('owner@company.com')
                        setPassword('owner123')
                        toast.success('Credentials filled!')
                      }}
                    >
                      Fill
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
