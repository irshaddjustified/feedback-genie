'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

export default function DebugAuth() {
  const [email, setEmail] = useState('admin@insighture.com');
  const [password, setPassword] = useState('admin123');
  const [loginResult, setLoginResult] = useState<string>('');
  const { user, signInWithEmail, signOut, loading, error, isAuthenticated, isAdmin, isSuperAdmin } = useAuth();

  const handleLogin = async () => {
    try {
      setLoginResult('Attempting login...');
      const result = await signInWithEmail(email, password);
      setLoginResult(`Login successful! User: ${JSON.stringify(result, null, 2)}`);
    } catch (err) {
      setLoginResult(`Login failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      setLoginResult('Logged out successfully');
    } catch (err) {
      setLoginResult(`Logout failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Authentication Debug Page</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-2">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter email"
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium mb-2">
                  Password
                </label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button onClick={handleLogin} disabled={loading}>
                {loading ? 'Signing In...' : 'Sign In'}
              </Button>
              <Button onClick={handleLogout} variant="outline" disabled={!user}>
                Sign Out
              </Button>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {loginResult && (
              <Alert>
                <AlertDescription>
                  <pre className="whitespace-pre-wrap text-xs">{loginResult}</pre>
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Current User Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="font-medium">Authentication Status:</span>
                <Badge variant={isAuthenticated ? "success" : "secondary"}>
                  {isAuthenticated ? 'Authenticated' : 'Not Authenticated'}
                </Badge>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="font-medium">Loading:</span>
                <Badge variant={loading ? "warning" : "secondary"}>
                  {loading ? 'Loading...' : 'Ready'}
                </Badge>
              </div>

              {user && (
                <>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Role:</span>
                    <Badge variant="outline">{user.role}</Badge>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Is Admin:</span>
                    <Badge variant={isAdmin ? "success" : "secondary"}>
                      {isAdmin ? 'Yes' : 'No'}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Is Super Admin:</span>
                    <Badge variant={isSuperAdmin ? "success" : "secondary"}>
                      {isSuperAdmin ? 'Yes' : 'No'}
                    </Badge>
                  </div>

                  <div>
                    <span className="font-medium">User Details:</span>
                    <pre className="mt-2 bg-gray-100 p-3 rounded text-xs overflow-auto">
                      {JSON.stringify(user, null, 2)}
                    </pre>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Demo Credentials</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="bg-blue-50 p-3 rounded">
                <h4 className="font-semibold text-blue-900">Super Admin</h4>
                <p className="text-sm text-blue-700">
                  Email: <code>admin@insighture.com</code> | Password: <code>admin123</code>
                </p>
              </div>
              <div className="bg-green-50 p-3 rounded">
                <h4 className="font-semibold text-green-900">Demo Super Admin</h4>
                <p className="text-sm text-green-700">
                  Email: <code>demo@insighture.com</code> | Password: <code>demo123</code>
                </p>
              </div>
              <div className="bg-purple-50 p-3 rounded">
                <h4 className="font-semibold text-purple-900">Demo Admin</h4>
                <p className="text-sm text-purple-700">
                  Email: <code>admin@company.com</code> | Password: <code>admin123</code>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Environment Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-medium">Firebase Project ID:</span> 
                <code className="ml-2">{process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'Not set'}</code>
              </div>
              <div>
                <span className="font-medium">Firebase Auth Domain:</span> 
                <code className="ml-2">{process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'Not set'}</code>
              </div>
              <div>
                <span className="font-medium">Demo Mode:</span> 
                <code className="ml-2">{process.env.NEXT_PUBLIC_DEMO_MODE || 'Not set'}</code>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
