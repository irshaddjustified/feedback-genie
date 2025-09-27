'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function QuickFix() {
  const [user, setUser] = useState<any>(null);
  const [status, setStatus] = useState('Checking...');
  const router = useRouter();

  useEffect(() => {
    const quickLogin = async () => {
      try {
        setStatus('Logging in with admin credentials...');
        
        // Force login with admin credentials
        const result = await authService.signInWithEmail('admin@insighture.com', 'admin123');
        
        if (result) {
          setUser(result);
          setStatus('✅ Login successful! Redirecting to dashboard...');
          
          // Wait a moment then redirect
          setTimeout(() => {
            window.location.href = '/admin/dashboard';
          }, 1000);
        } else {
          setStatus('❌ Login failed');
        }
      } catch (error: any) {
        console.error('Quick login error:', error);
        setStatus(`❌ Error: ${error.message}`);
      }
    };

    quickLogin();
  }, []);

  const manualDashboard = () => {
    window.location.href = '/admin/dashboard';
  };

  const tryDemo = async () => {
    try {
      setStatus('Trying demo credentials...');
      const result = await authService.signInWithEmail('demo@insighture.com', 'demo123');
      if (result) {
        setUser(result);
        setStatus('✅ Demo login successful!');
        setTimeout(() => {
          window.location.href = '/admin/dashboard';
        }, 500);
      }
    } catch (error: any) {
      setStatus(`❌ Demo failed: ${error.message}`);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>🚀 Quick Demo Fix</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <p className="font-medium">{status}</p>
          </div>

          {user && (
            <div className="bg-green-50 p-3 rounded border">
              <p className="text-sm text-green-800">
                ✅ Logged in as: <strong>{user.email}</strong>
              </p>
              <p className="text-sm text-green-800">
                Role: <strong>{user.role}</strong>
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Button onClick={manualDashboard} className="w-full">
              🎯 Go to Dashboard Now
            </Button>
            
            <Button onClick={tryDemo} variant="outline" className="w-full">
              🧪 Try Demo Login
            </Button>
            
            <Button 
              onClick={() => window.location.href = '/auth-status'} 
              variant="outline" 
              className="w-full"
            >
              🔍 Check Auth Status
            </Button>
          </div>

          <div className="text-xs text-gray-600 space-y-1">
            <p>If dashboard is blank, try:</p>
            <p>• Open browser console (F12)</p>
            <p>• Check for JavaScript errors</p>
            <p>• Try hard refresh (Ctrl+Shift+R)</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
