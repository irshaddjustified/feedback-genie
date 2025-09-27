'use client'

import { useAuth } from '@/lib/contexts/AuthContext'
import { PERMISSIONS } from '@/lib/permissions'

export function AuthDebug() {
  const { user, loading, isAuthenticated } = useAuth()

  if (loading) {
    return <div className="p-4 bg-yellow-100 border rounded">Loading auth state...</div>
  }

  return (
    <div className="p-4 bg-blue-100 border rounded mb-4">
      <h3 className="font-bold mb-2">Auth Debug Info:</h3>
      <div className="text-sm space-y-1">
        <div>Is Authenticated: {isAuthenticated ? 'Yes' : 'No'}</div>
        <div>User: {user ? 'Present' : 'None'}</div>
        {user && (
          <>
            <div>Email: {user.email}</div>
            <div>Role: {user.role}</div>
            <div>Is Anonymous: {user.isAnonymous ? 'Yes' : 'No'}</div>
            <div>Permissions Count: {user.permissions?.length || 0}</div>
            <div>Has VIEW_SURVEYS: {user.permissions?.includes(PERMISSIONS.VIEW_SURVEYS) ? 'Yes' : 'No'}</div>
            <div>Permissions: {user.permissions?.join(', ')}</div>
          </>
        )}
      </div>
    </div>
  )
}
