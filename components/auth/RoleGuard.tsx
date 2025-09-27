'use client'

import { ReactNode, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/contexts/AuthContext'
import { Permission, PermissionManager } from '@/lib/permissions'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Shield, ArrowLeft, Home } from 'lucide-react'
import Link from 'next/link'

interface RoleGuardProps {
  children: ReactNode
  requiredPermission?: Permission
  requiredRole?: 'super_admin' | 'admin' | 'owner' | 'user'
  requiredPermissions?: Permission[]
  fallbackComponent?: ReactNode
  redirectTo?: string
  allowAnonymous?: boolean
}

export function RoleGuard({
  children,
  requiredPermission,
  requiredRole,
  requiredPermissions = [],
  fallbackComponent,
  redirectTo,
  allowAnonymous = false
}: RoleGuardProps) {
  const { user, loading, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (loading) return

    // If user is not authenticated and anonymous access is not allowed
    if (!isAuthenticated && !allowAnonymous) {
      if (redirectTo) {
        router.push(redirectTo)
      } else {
        router.push('/auth/login')
      }
      return
    }

    // Check role requirements
    if (requiredRole && user) {
      const hasRequiredRole = checkRole(user, requiredRole)
      if (!hasRequiredRole && redirectTo) {
        router.push(redirectTo)
        return
      }
    }
  }, [user, loading, isAuthenticated, requiredRole, redirectTo, router, allowAnonymous])

  // Helper function to check role hierarchy
  const checkRole = (user: any, role: string): boolean => {
    switch (role) {
      case 'super_admin':
        return PermissionManager.isSuperAdmin(user)
      case 'admin':
        return PermissionManager.isAdmin(user)
      case 'owner':
        return PermissionManager.isOwner(user)
      case 'user':
        return true // All authenticated users are at least 'user' level
      default:
        return false
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  // Not authenticated
  if (!isAuthenticated && !allowAnonymous) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8 p-8">
          <div className="text-center">
            <Shield className="mx-auto h-12 w-12 text-gray-400" />
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Authentication Required
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              You need to sign in to access this page
            </p>
          </div>
          <div className="space-y-4">
            <Button asChild className="w-full">
              <Link href="/auth/login">
                Sign In
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/">
                <Home className="h-4 w-4 mr-2" />
                Go Home
              </Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Check specific permission requirements
  if (requiredPermission && user && !PermissionManager.hasPermission(user, requiredPermission)) {
    return fallbackComponent || (
      <div className="container mx-auto py-12">
        <Alert variant="destructive">
          <Shield className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>You do not have permission to access this resource.</span>
            <Button asChild variant="outline" size="sm">
              <Link href="/admin/dashboard">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go Back
              </Link>
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  // Check multiple permissions requirement
  if (requiredPermissions.length > 0 && user && !PermissionManager.hasAnyPermission(user, requiredPermissions)) {
    return fallbackComponent || (
      <div className="container mx-auto py-12">
        <Alert variant="destructive">
          <Shield className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>You do not have the required permissions to access this resource.</span>
            <Button asChild variant="outline" size="sm">
              <Link href="/admin/dashboard">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go Back
              </Link>
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  // Check role requirements
  if (requiredRole && user && !checkRole(user, requiredRole)) {
    return fallbackComponent || (
      <div className="container mx-auto py-12">
        <Alert variant="destructive">
          <Shield className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>
              You need {requiredRole.replace('_', ' ')} privileges to access this page. 
              Current role: {user.role?.replace('_', ' ')}
            </span>
            <Button asChild variant="outline" size="sm">
              <Link href="/admin/dashboard">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go Back
              </Link>
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  // All checks passed, render children
  return <>{children}</>
}

// Convenience wrapper components
export function AdminGuard({ children, ...props }: Omit<RoleGuardProps, 'requiredRole'>) {
  return (
    <RoleGuard requiredRole="admin" {...props}>
      {children}
    </RoleGuard>
  )
}

export function SuperAdminGuard({ children, ...props }: Omit<RoleGuardProps, 'requiredRole'>) {
  return (
    <RoleGuard requiredRole="super_admin" {...props}>
      {children}
    </RoleGuard>
  )
}

export function OwnerGuard({ children, ...props }: Omit<RoleGuardProps, 'requiredRole'>) {
  return (
    <RoleGuard requiredRole="owner" {...props}>
      {children}
    </RoleGuard>
  )
}
