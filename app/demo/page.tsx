'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/lib/contexts/AuthContext'
import { DEMO_CREDENTIALS } from '@/lib/firebase'
import { 
  Crown, 
  Shield, 
  Users, 
  User,
  Copy,
  LogIn,
  Check,
  ArrowRight,
  Sparkles
} from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import Link from 'next/link'

export default function DemoPage() {
  const { signInWithEmail, user, loading } = useAuth()
  const [copied, setCopied] = useState<string | null>(null)
  const [signingIn, setSigningIn] = useState<string | null>(null)

  const demoAccounts = [
    {
      id: 'super_admin',
      title: 'Super Admin',
      description: 'Full system access - can manage everything',
      icon: <Crown className="h-6 w-6 text-yellow-500" />,
      badgeColor: 'bg-yellow-100 text-yellow-800',
      credentials: DEMO_CREDENTIALS.super_admin,
      permissions: [
        'Manage all organizations',
        'Manage admins and users',
        'System configuration',
        'All survey and analytics access'
      ]
    },
    {
      id: 'admin',
      title: 'Organization Admin',
      description: 'Manage organization users and surveys',
      icon: <Shield className="h-6 w-6 text-blue-500" />,
      badgeColor: 'bg-blue-100 text-blue-800',
      credentials: DEMO_CREDENTIALS.admin,
      permissions: [
        'Manage organization users',
        'Send invitations',
        'Create and manage all surveys',
        'View analytics and reports',
        'Manage clients and projects'
      ]
    },
    {
      id: 'owner',
      title: 'Survey Owner',
      description: 'Create and manage surveys',
      icon: <Users className="h-6 w-6 text-green-500" />,
      badgeColor: 'bg-green-100 text-green-800',
      credentials: DEMO_CREDENTIALS.owner,
      permissions: [
        'Create and edit surveys',
        'View survey responses',
        'Access analytics for own surveys',
        'Export survey data'
      ]
    }
  ]

  const handleCopyCredentials = (credentials: any) => {
    const text = `Email: ${credentials.email}\nPassword: ${credentials.password}`
    navigator.clipboard.writeText(text)
    setCopied(credentials.email)
    setTimeout(() => setCopied(null), 2000)
  }

  const handleDemoLogin = async (credentials: any) => {
    try {
      setSigningIn(credentials.email)
      await signInWithEmail(credentials.email, credentials.password)
      // Redirect will happen automatically via auth state change
    } catch (error) {
      console.error('Demo login error:', error)
    } finally {
      setSigningIn(null)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5">
      <div className="container mx-auto py-12 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex justify-center items-center space-x-2 mb-4">
            <Sparkles className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold">FeedbackGenie Demo</h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Explore different user roles and permissions with our demo accounts. 
            Each role provides different levels of access to the system.
          </p>
        </div>

        {user && (
          <Alert>
            <Check className="h-4 w-4" />
            <AlertDescription>
              You are currently logged in as <strong>{user.email}</strong> with role <strong>{user.role}</strong>.
              <Link href="/admin/dashboard" className="ml-2 underline">
                Go to Dashboard <ArrowRight className="inline h-4 w-4" />
              </Link>
            </AlertDescription>
          </Alert>
        )}

        {/* Demo Accounts Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {demoAccounts.map((account) => (
            <Card key={account.id} className="relative overflow-hidden">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    {account.icon}
                    <CardTitle className="text-xl">{account.title}</CardTitle>
                  </div>
                  <Badge className={account.badgeColor}>
                    {account.id.replace('_', ' ')}
                  </Badge>
                </div>
                <CardDescription>{account.description}</CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Credentials */}
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 space-y-2">
                  <div className="text-sm font-medium">Demo Credentials:</div>
                  <div className="text-sm font-mono">
                    <div>Email: {account.credentials.email}</div>
                    <div>Password: {account.credentials.password}</div>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopyCredentials(account.credentials)}
                      disabled={loading}
                    >
                      {copied === account.credentials.email ? (
                        <Check className="h-4 w-4 mr-2" />
                      ) : (
                        <Copy className="h-4 w-4 mr-2" />
                      )}
                      {copied === account.credentials.email ? 'Copied!' : 'Copy'}
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleDemoLogin(account.credentials)}
                      disabled={loading || signingIn === account.credentials.email}
                    >
                      <LogIn className="h-4 w-4 mr-2" />
                      {signingIn === account.credentials.email ? 'Signing in...' : 'Try Now'}
                    </Button>
                  </div>
                </div>

                {/* Permissions */}
                <div>
                  <div className="text-sm font-medium mb-2">Permissions:</div>
                  <ul className="text-sm space-y-1">
                    {account.permissions.map((permission, index) => (
                      <li key={index} className="flex items-center space-x-2">
                        <Check className="h-3 w-3 text-green-500 flex-shrink-0" />
                        <span>{permission}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Role Hierarchy Explanation */}
        <Card>
          <CardHeader>
            <CardTitle>Role Hierarchy & Workflow</CardTitle>
            <CardDescription>
              Understanding how the different roles work together in FeedbackGenie
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-2">Role Hierarchy</h3>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Crown className="h-4 w-4 text-yellow-500" />
                    <span className="font-medium">Super Admin</span>
                    <span className="text-sm text-muted-foreground">→ Manages entire system</span>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <Shield className="h-4 w-4 text-blue-500" />
                    <span className="font-medium">Admin</span>
                    <span className="text-sm text-muted-foreground">→ Manages organization</span>
                  </div>
                  <div className="flex items-center space-x-2 ml-8">
                    <Users className="h-4 w-4 text-green-500" />
                    <span className="font-medium">Owner</span>
                    <span className="text-sm text-muted-foreground">→ Creates surveys</span>
                  </div>
                  <div className="flex items-center space-x-2 ml-12">
                    <User className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">User</span>
                    <span className="text-sm text-muted-foreground">→ Submits responses</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Typical Workflow</h3>
                <ol className="space-y-1 text-sm">
                  <li>1. <strong>Admin</strong> sets up organization and invites <strong>Owners</strong></li>
                  <li>2. <strong>Owners</strong> create surveys for their projects</li>
                  <li>3. <strong>Admin</strong> can view all surveys and analytics</li>
                  <li>4. <strong>Users</strong> submit feedback through survey links</li>
                  <li>5. <strong>Owners/Admins</strong> analyze responses and generate reports</li>
                </ol>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Start */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Start Guide</CardTitle>
            <CardDescription>
              Get started with FeedbackGenie in 3 easy steps
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center space-y-2">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold mx-auto">1</div>
                <h4 className="font-medium">Choose a Role</h4>
                <p className="text-sm text-muted-foreground">
                  Select one of the demo accounts above to explore different capabilities
                </p>
              </div>
              <div className="text-center space-y-2">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold mx-auto">2</div>
                <h4 className="font-medium">Explore Features</h4>
                <p className="text-sm text-muted-foreground">
                  Navigate through the admin panel to see role-specific features
                </p>
              </div>
              <div className="text-center space-y-2">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold mx-auto">3</div>
                <h4 className="font-medium">Create & Test</h4>
                <p className="text-sm text-muted-foreground">
                  Create surveys, invite users, and see the complete feedback flow
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Need help? Check out our{' '}
            <Link href="/docs" className="underline">documentation</Link>
            {' '}or{' '}
            <Link href="/support" className="underline">contact support</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
