'use client'

import { RoleGuard } from './RoleGuard'
import { PERMISSIONS } from '@/lib/permissions'

interface AdminAuthGuardProps {
  children: React.ReactNode
  requiresAdmin?: boolean
}

export default function AdminAuthGuard({ children, requiresAdmin = true }: AdminAuthGuardProps) {
  if (requiresAdmin) {
    return (
      <RoleGuard 
        requiredRole="owner" 
        redirectTo="/auth/login"
      >
        {children}
      </RoleGuard>
    )
  }

  return (
    <RoleGuard 
      allowAnonymous={false}
      redirectTo="/auth/login"
    >
      {children}
    </RoleGuard>
  )
}
