'use client'

import { useAuth } from '@/lib/contexts/AuthContext'
import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function TestAuthPage() {
  const { user, loading, isAuthenticated, signInWithEmail } = useAuth()
  const [loginStatus, setLoginStatus] = useState<string>('Checking auth...')
  
  useEffect(() => {
    console.log('TestAuthPage mounted, auth state:', {
      loading,
      isAuthenticated,
      user: user ? {
        email: user.email,
        role: user.role,
        permissions: user.permissions?.length
      } : null
    })
    
    if (!loading) {
      if (isAuthenticated && user) {
        setLoginStatus(`Logged in as ${user.email} (${user.role})`)
      } else {
        setLoginStatus('Not logged in')
      }
    }
  }, [user, loading, isAuthenticated])
  
  const handleTestLogin = async () => {
    try {
      setLoginStatus('Logging in...')
      const result = await signInWithEmail('demo@insighture.com', 'demo123')
      if (result) {
        setLoginStatus(`Login successful! Role: ${result.role}`)
      } else {
        setLoginStatus('Login failed')
      }
    } catch (error) {
      setLoginStatus(`Login error: ${error}`)
    }
  }
  
  return (
    <div className="min-h-screen p-8">
      <h1 className="text-2xl font-bold mb-4">Auth Test Page</h1>
      
      <div className="space-y-4">
        <div className="p-4 border rounded">
          <h2 className="font-semibold mb-2">Current Status:</h2>
          <p>{loginStatus}</p>
        </div>
        
        <div className="p-4 border rounded">
          <h2 className="font-semibold mb-2">Auth State:</h2>
          <ul className="space-y-1 text-sm">
            <li>Loading: {loading ? '✅' : '❌'}</li>
            <li>Authenticated: {isAuthenticated ? '✅' : '❌'}</li>
            <li>Email: {user?.email || 'N/A'}</li>
            <li>Role: {user?.role || 'N/A'}</li>
            <li>Anonymous: {user?.isAnonymous ? '✅' : '❌'}</li>
          </ul>
        </div>
        
        <div className="space-x-4">
          <button
            onClick={handleTestLogin}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Test Login (demo@insighture.com)
          </button>
          
          <Link
            href="/admin/dashboard"
            className="inline-block px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Go to Dashboard
          </Link>
          
          <Link
            href="/admin/dashboard/debug"
            className="inline-block px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
          >
            Go to Debug Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
