'use client';

import { useState } from 'react';
import { authService } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function TestLogin() {
  const [email, setEmail] = useState('admin@insighture.com');
  const [password, setPassword] = useState('admin123');
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const testLogin = async () => {
    try {
      setLoading(true);
      setError('');
      setResult(null);
      
      console.log('Testing login with:', { email, password });
      
      const user = await authService.signInWithEmail(email, password);
      
      console.log('Login result:', user);
      setResult(user);
      
      if (user) {
        console.log('User role:', user.role);
        console.log('Is admin:', authService.isAdmin(user));
        console.log('Is super admin:', authService.isSuperAdmin(user));
        console.log('Permissions:', user.permissions);
      }
      
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Login Test Page</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label>Email:</label>
            <Input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
            />
          </div>
          
          <div>
            <label>Password:</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
            />
          </div>
          
          <Button onClick={testLogin} disabled={loading}>
            {loading ? 'Testing...' : 'Test Login'}
          </Button>
          
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {result && (
            <div className="space-y-2">
              <Alert>
                <AlertDescription>
                  <strong>Login Successful!</strong>
                </AlertDescription>
              </Alert>
              
              <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
              
              <div className="space-y-1">
                <p><strong>Role:</strong> {result.role}</p>
                <p><strong>Is Admin:</strong> {authService.isAdmin(result) ? 'Yes' : 'No'}</p>
                <p><strong>Is Super Admin:</strong> {authService.isSuperAdmin(result) ? 'Yes' : 'No'}</p>
                <p><strong>Permissions:</strong> {result.permissions?.join(', ')}</p>
              </div>
              
              <div className="pt-4">
                <a 
                  href="/admin/dashboard" 
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Go to Admin Dashboard
                </a>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
