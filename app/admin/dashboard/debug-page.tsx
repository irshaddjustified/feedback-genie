'use client'

import { useEffect } from 'react'
import { useAuth } from '@/lib/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import AdminAuthGuard from '@/components/auth/AdminAuthGuard'

export default function DebugDashboard() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Debug Dashboard</h1>
      
      <div className="space-y-8">
        <section>
          <h2 className="text-xl font-semibold mb-2">Without AdminAuthGuard</h2>
          <PlainDebugInfo />
        </section>
        
        <section>
          <h2 className="text-xl font-semibold mb-2">With AdminAuthGuard</h2>
          <AdminAuthGuard>
            <GuardedDebugInfo />
          </AdminAuthGuard>
        </section>
      </div>
    </div>
  )
}

function PlainDebugInfo() {
  const { user, loading, isAuthenticated } = useAuth()
  
  useEffect(() => {
    console.log('PlainDebugInfo - Auth State:', {
      user,
      loading,
      isAuthenticated,
      userEmail: user?.email,
      userRole: user?.role,
      userPermissions: user?.permissions
    })
  }, [user, loading, isAuthenticated])
  
  return (
    <div className="border p-4 rounded bg-gray-50">
      <div className="space-y-2 text-sm">
        <p><strong>Loading:</strong> {loading ? 'Yes' : 'No'}</p>
        <p><strong>Authenticated:</strong> {isAuthenticated ? 'Yes' : 'No'}</p>
        <p><strong>User Email:</strong> {user?.email || 'None'}</p>
        <p><strong>User Role:</strong> {user?.role || 'None'}</p>
        <p><strong>Is Anonymous:</strong> {user?.isAnonymous ? 'Yes' : 'No'}</p>
        <p><strong>Permissions Count:</strong> {user?.permissions?.length || 0}</p>
      </div>
    </div>
  )
}

function GuardedDebugInfo() {
  const { user } = useAuth()
  
  return (
    <div className="border p-4 rounded bg-green-50">
      <p className="text-green-800">✅ Successfully passed AdminAuthGuard!</p>
      <p className="text-sm mt-2">User: {user?.email} ({user?.role})</p>
    </div>
  )
}
