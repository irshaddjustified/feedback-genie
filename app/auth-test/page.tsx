'use client'

import { useAuth } from '@/lib/contexts/AuthContext'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AuthTestPage() {
  const { user, loading, signInWithEmail, signOut, isAuthenticated } = useAuth()
  const [email, setEmail] = useState('admin@company.com')
  const [password, setPassword] = useState('admin123')
  const [error, setError] = useState('')
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      await signInWithEmail(email, password)
      router.push('/admin/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    }
  }

  const handleLogout = async () => {
    await signOut()
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Auth Test Page</h1>
      
      <div className="space-y-6">
        {/* Current Status */}
        <div className="p-4 bg-gray-100 rounded-lg">
          <h2 className="font-semibold mb-2">Current Status:</h2>
          <ul className="space-y-1 text-sm">
            <li>Authenticated: {isAuthenticated ? '✅' : '❌'}</li>
            <li>Email: {user?.email || 'Not logged in'}</li>
            <li>Role: {user?.role || 'N/A'}</li>
            <li>UID: {user?.uid || 'N/A'}</li>
          </ul>
        </div>

        {/* Login Form */}
        {!isAuthenticated && (
          <form onSubmit={handleLogin} className="space-y-4">
            <h2 className="font-semibold">Login:</h2>
            {error && (
              <div className="p-3 bg-red-100 text-red-700 rounded">
                {error}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border rounded"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Login
            </button>
            
            <div className="pt-4 border-t">
              <p className="text-sm font-medium mb-2">Quick Login Demo Accounts:</p>
              <div className="space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setEmail('admin@company.com')
                    setPassword('admin123')
                  }}
                  className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200"
                >
                  Admin Account
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEmail('demo@insighture.com')
                    setPassword('demo123')
                  }}
                  className="px-3 py-1 text-xs bg-purple-100 text-purple-700 rounded hover:bg-purple-200"
                >
                  Super Admin
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEmail('owner@company.com')
                    setPassword('owner123')
                  }}
                  className="px-3 py-1 text-xs bg-orange-100 text-orange-700 rounded hover:bg-orange-200"
                >
                  Owner Account
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Logout Button */}
        {isAuthenticated && (
          <div className="space-y-4">
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Logout
            </button>
            <button
              onClick={() => router.push('/admin/dashboard')}
              className="ml-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Go to Dashboard
            </button>
          </div>
        )}

        {/* Test Links */}
        <div className="pt-6 border-t">
          <h2 className="font-semibold mb-2">Test Links:</h2>
          <div className="space-x-4">
            <a href="/admin/dashboard" className="text-blue-500 hover:underline">
              Dashboard (Protected)
            </a>
            <a href="/test-auth" className="text-blue-500 hover:underline">
              Test Auth Status
            </a>
            <a href="/admin/dashboard/debug" className="text-blue-500 hover:underline">
              Debug Dashboard
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
