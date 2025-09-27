'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useFirebaseAuth } from '@/lib/hooks/useFirebaseAuth';
import { AppUser } from '@/lib/firebase';
import { Permission, PermissionManager } from '@/lib/permissions';

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  error: string | null;
  signInWithEmail: (email: string, password: string) => Promise<AppUser | null>;
  signInWithGoogle: () => Promise<AppUser | null>;
  signInAnonymously: () => Promise<AppUser | null>;
  createAccount: (email: string, password: string, displayName?: string) => Promise<AppUser | null>;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
  
  // Role checking methods
  isAdmin: boolean;
  isSuperAdmin: boolean;
  isOwner: boolean;
  
  // Permission checking methods
  hasPermission: (permission: Permission) => boolean;
  hasAnyPermission: (permissions: Permission[]) => boolean;
  hasAllPermissions: (permissions: Permission[]) => boolean;
  
  // Convenience methods
  canManageUsers: boolean;
  canManageSurveys: boolean;
  canViewAnalytics: boolean;
  canSendInvites: boolean;
  canAccessAdminPanel: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const auth = useFirebaseAuth();
  
  // Enhanced auth context with permission methods
  const enhancedAuth: AuthContextType = {
    ...auth,
    
    // Role checking
    isAdmin: PermissionManager.isAdmin(auth.user),
    isSuperAdmin: PermissionManager.isSuperAdmin(auth.user),
    isOwner: PermissionManager.isOwner(auth.user),
    
    // Permission checking methods
    hasPermission: (permission: Permission) => PermissionManager.hasPermission(auth.user, permission),
    hasAnyPermission: (permissions: Permission[]) => PermissionManager.hasAnyPermission(auth.user, permissions),
    hasAllPermissions: (permissions: Permission[]) => PermissionManager.hasAllPermissions(auth.user, permissions),
    
    // Convenience methods
    canManageUsers: PermissionManager.canManageUsers(auth.user),
    canManageSurveys: PermissionManager.canManageSurveys(auth.user),
    canViewAnalytics: PermissionManager.canViewAnalytics(auth.user),
    canSendInvites: PermissionManager.canSendInvites(auth.user),
    canAccessAdminPanel: PermissionManager.canAccessAdminPanel(auth.user)
  };

  return (
    <AuthContext.Provider value={enhancedAuth}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
