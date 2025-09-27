'use client'

import { useEffect } from 'react'
import { useAuth } from '@/lib/contexts/AuthContext'
import { useRouter } from 'next/navigation'

export default function TestDashboard() {
  const { user, loading, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    console.log('TestDashboard - Auth State:', {
      user,
      loading,
      isAuthenticated,
      userRole: user?.role
    })
  }, [user, loading, isAuthenticated])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading dashboard...</p>
          <p className="text-xs mt-2">Auth loading: {loading ? 'Yes' : 'No'}</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p>Not authenticated</p>
          <button onClick={() => router.push('/auth/login')} className="mt-2 px-4 py-2 bg-blue-500 text-white rounded">
            Go to Login
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <h1>Test Dashboard</h1>
      <p>User: {user?.email}</p>
      <p>Role: {user?.role}</p>
      <p>Authenticated: {isAuthenticated ? 'Yes' : 'No'}</p>
    </div>
  )
}
