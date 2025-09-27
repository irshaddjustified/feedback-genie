'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/contexts/AuthContext'
import { authService } from '@/lib/firebase'

export default function SimpleLoginPage() {
  const [status, setStatus] = useState('')
  const { user, loading, isAuthenticated } = useAuth()

  const testAdminLogin = async () => {
    setStatus('Testing admin login...')
    try {
      const result = await authService.signInWithEmail('admin@company.com', 'admin123')
      setStatus(`Success! User: ${JSON.stringify(result, null, 2)}`)
    } catch (error) {
      setStatus(`Error: ${error}`)
    }
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Simple Login Test</h1>
      
      <div className="space-y-4">
        <div className="p-4 bg-gray-100 rounded">
          <h2 className="font-semibold">Current Auth State:</h2>
          <p>Loading: {loading ? 'Yes' : 'No'}</p>
          <p>Authenticated: {isAuthenticated ? 'Yes' : 'No'}</p>
          <p>User: {user ? user.email : 'None'}</p>
          <p>Role: {user?.role || 'None'}</p>
        </div>

        <button
          onClick={testAdminLogin}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          Test Admin Login
        </button>

        <div className="p-4 bg-white border rounded">
          <h3 className="font-semibold mb-2">Status:</h3>
          <pre className="text-xs overflow-auto">{status}</pre>
        </div>

        {isAuthenticated && (
          <div className="p-4 bg-green-100 rounded">
            <p className="text-green-800">✅ Authentication successful!</p>
            <a 
              href="/admin/dashboard" 
              className="inline-block mt-2 px-4 py-2 bg-green-500 text-white rounded"
            >
              Go to Dashboard
            </a>
          </div>
        )}
      </div>
    </div>
  )
}
