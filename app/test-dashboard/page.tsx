'use client'

import { useAuth } from '@/lib/contexts/AuthContext'
import { PermissionManager, PERMISSIONS } from '@/lib/permissions'

export default function TestDashboard() {
  const { user, loading, isAuthenticated } = useAuth()

  if (loading) {
    return <div className="p-8">Loading...</div>
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Test Dashboard (No Guards)</h1>
      
      <div className="space-y-4">
        <div className="p-4 bg-gray-100 rounded">
          <h2 className="font-semibold mb-2">Auth Status:</h2>
          <p>Authenticated: {isAuthenticated ? 'Yes' : 'No'}</p>
          <p>Loading: {loading ? 'Yes' : 'No'}</p>
          <p>User: {user?.email || 'None'}</p>
          <p>Role: {user?.role || 'None'}</p>
          <p>Anonymous: {user?.isAnonymous ? 'Yes' : 'No'}</p>
          <p>Permissions Count: {user?.permissions?.length || 0}</p>
        </div>

        <div className="p-4 bg-blue-100 rounded">
          <h2 className="font-semibold mb-2">Permission Checks:</h2>
          <p>Has CREATE_SURVEYS: {user ? PermissionManager.hasPermission(user, PERMISSIONS.CREATE_SURVEYS) ? 'Yes' : 'No' : 'No user'}</p>
          <p>Is Admin: {user ? PermissionManager.isAdmin(user) ? 'Yes' : 'No' : 'No user'}</p>
          <p>Can Access Admin Panel: {user ? PermissionManager.canAccessAdminPanel(user) ? 'Yes' : 'No' : 'No user'}</p>
        </div>

        <div className="p-4 bg-yellow-100 rounded">
          <h2 className="font-semibold mb-2">Raw Permissions:</h2>
          <pre className="text-xs">{JSON.stringify(user?.permissions, null, 2)}</pre>
        </div>

        <div className="p-4 bg-green-100 rounded">
          <h2 className="font-semibold mb-2">Full User Object:</h2>
          <pre className="text-xs overflow-auto">{JSON.stringify(user, null, 2)}</pre>
        </div>

        {isAuthenticated && (
          <div className="p-4 bg-purple-100 rounded">
            <p className="text-purple-800 mb-2">✅ User is authenticated!</p>
            <a 
              href="/admin/dashboard" 
              className="inline-block px-4 py-2 bg-purple-500 text-white rounded"
            >
              Try Real Dashboard
            </a>
          </div>
        )}
      </div>
    </div>
  )
}
