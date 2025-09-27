'use client';

import { useAuth } from '@/lib/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { authService } from '@/lib/firebase';
import Link from 'next/link';

export default function AuthStatus() {
  const { user, loading, isAuthenticated, isAdmin, isSuperAdmin } = useAuth();

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading authentication status...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Authentication Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="font-medium">Authenticated:</span>
              <Badge variant={isAuthenticated ? "default" : "secondary"} className="ml-2">
                {isAuthenticated ? 'Yes' : 'No'}
              </Badge>
            </div>
            
            <div>
              <span className="font-medium">Loading:</span>
              <Badge variant={loading ? "warning" : "secondary"} className="ml-2">
                {loading ? 'Yes' : 'No'}
              </Badge>
            </div>
            
            <div>
              <span className="font-medium">Is Admin:</span>
              <Badge variant={isAdmin ? "default" : "secondary"} className="ml-2">
                {isAdmin ? 'Yes' : 'No'}
              </Badge>
            </div>
            
            <div>
              <span className="font-medium">Is Super Admin:</span>
              <Badge variant={isSuperAdmin ? "default" : "secondary"} className="ml-2">
                {isSuperAdmin ? 'Yes' : 'No'}
              </Badge>
            </div>
          </div>

          {user && (
            <div className="mt-4">
              <h3 className="font-semibold mb-2">User Details:</h3>
              <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto">
                {JSON.stringify(user, null, 2)}
              </pre>
              
              <div className="mt-4 space-y-2">
                <p><strong>Role:</strong> {user.role}</p>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Auth Service isAdmin:</strong> {authService.isAdmin(user) ? 'Yes' : 'No'}</p>
                <p><strong>Auth Service isSuperAdmin:</strong> {authService.isSuperAdmin(user) ? 'Yes' : 'No'}</p>
              </div>
            </div>
          )}
          
          <div className="space-y-2 pt-4">
            <h3 className="font-semibold">Navigation Tests:</h3>
            
            <div className="space-x-2">
              <Button asChild variant="outline">
                <Link href="/auth/login">Go to Login</Link>
              </Button>
              
              <Button asChild variant="outline">
                <Link href="/test-login">Test Login Page</Link>
              </Button>
              
              <Button asChild variant={isAdmin ? "default" : "secondary"}>
                <Link href="/admin/dashboard">
                  Admin Dashboard {!isAdmin && '(Should Redirect)'}
                </Link>
              </Button>
              
              <Button asChild variant="outline">
                <Link href="/debug-auth">Debug Auth</Link>
              </Button>
            </div>
          </div>
          
          {!isAuthenticated && (
            <div className="bg-yellow-50 border border-yellow-200 rounded p-4 mt-4">
              <h4 className="font-semibold text-yellow-800">Not Authenticated</h4>
              <p className="text-yellow-700 text-sm">
                You need to log in to access the admin dashboard. Try the credentials:
              </p>
              <ul className="text-yellow-700 text-sm mt-2">
                <li>• <code>admin@insighture.com</code> / <code>admin123</code></li>
                <li>• <code>demo@insighture.com</code> / <code>demo123</code></li>
              </ul>
            </div>
          )}
          
          {isAuthenticated && !isAdmin && (
            <div className="bg-red-50 border border-red-200 rounded p-4 mt-4">
              <h4 className="font-semibold text-red-800">Access Denied</h4>
              <p className="text-red-700 text-sm">
                You are authenticated but don't have admin privileges. Current role: <strong>{user?.role}</strong>
              </p>
            </div>
          )}
          
          {isAuthenticated && isAdmin && (
            <div className="bg-green-50 border border-green-200 rounded p-4 mt-4">
              <h4 className="font-semibold text-green-800">Access Granted</h4>
              <p className="text-green-700 text-sm">
                You have admin privileges and should be able to access the dashboard.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
