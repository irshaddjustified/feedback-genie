import { AppUser } from '@/lib/firebase'

// Permission definitions
export const PERMISSIONS = {
  // System management
  MANAGE_SYSTEM: 'manage_system',
  MANAGE_ORGANIZATIONS: 'manage_organizations',
  
  // Admin permissions
  MANAGE_ORGANIZATION: 'manage_organization',
  MANAGE_ADMINS: 'manage_admins',
  MANAGE_USERS: 'manage_users',
  SEND_INVITES: 'send_invites',
  
  // Survey permissions
  MANAGE_SURVEYS: 'manage_surveys',
  CREATE_SURVEYS: 'create_surveys',
  EDIT_SURVEYS: 'edit_surveys',
  DELETE_SURVEYS: 'delete_surveys',
  VIEW_SURVEYS: 'view_surveys',
  PUBLISH_SURVEYS: 'publish_surveys',
  
  // Response permissions
  VIEW_RESPONSES: 'view_responses',
  SUBMIT_RESPONSES: 'submit_responses',
  DELETE_RESPONSES: 'delete_responses',
  
  // Analytics permissions
  VIEW_ANALYTICS: 'view_analytics',
  EXPORT_DATA: 'export_data',
  
  // Client management
  MANAGE_CLIENTS: 'manage_clients',
  VIEW_CLIENTS: 'view_clients',
  
  // Project management
  MANAGE_PROJECTS: 'manage_projects',
  VIEW_PROJECTS: 'view_projects'
} as const

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS]

// Role definitions with their permissions
export const ROLE_PERMISSIONS = {
  super_admin: [
    PERMISSIONS.MANAGE_SYSTEM,
    PERMISSIONS.MANAGE_ORGANIZATIONS,
    PERMISSIONS.MANAGE_ADMINS,
    PERMISSIONS.MANAGE_USERS,
    PERMISSIONS.MANAGE_SURVEYS,
    PERMISSIONS.CREATE_SURVEYS,
    PERMISSIONS.EDIT_SURVEYS,
    PERMISSIONS.DELETE_SURVEYS,
    PERMISSIONS.VIEW_SURVEYS,
    PERMISSIONS.PUBLISH_SURVEYS,
    PERMISSIONS.VIEW_RESPONSES,
    PERMISSIONS.DELETE_RESPONSES,
    PERMISSIONS.VIEW_ANALYTICS,
    PERMISSIONS.EXPORT_DATA,
    PERMISSIONS.SEND_INVITES,
    PERMISSIONS.MANAGE_CLIENTS,
    PERMISSIONS.VIEW_CLIENTS,
    PERMISSIONS.MANAGE_PROJECTS,
    PERMISSIONS.VIEW_PROJECTS
  ],
  admin: [
    PERMISSIONS.MANAGE_ORGANIZATION,
    PERMISSIONS.MANAGE_USERS,
    PERMISSIONS.MANAGE_SURVEYS,
    PERMISSIONS.CREATE_SURVEYS,
    PERMISSIONS.EDIT_SURVEYS,
    PERMISSIONS.DELETE_SURVEYS,
    PERMISSIONS.VIEW_SURVEYS,
    PERMISSIONS.PUBLISH_SURVEYS,
    PERMISSIONS.VIEW_RESPONSES,
    PERMISSIONS.VIEW_ANALYTICS,
    PERMISSIONS.EXPORT_DATA,
    PERMISSIONS.SEND_INVITES,
    PERMISSIONS.MANAGE_CLIENTS,
    PERMISSIONS.VIEW_CLIENTS,
    PERMISSIONS.MANAGE_PROJECTS,
    PERMISSIONS.VIEW_PROJECTS
  ],
  owner: [
    PERMISSIONS.CREATE_SURVEYS,
    PERMISSIONS.EDIT_SURVEYS,
    PERMISSIONS.VIEW_SURVEYS,
    PERMISSIONS.PUBLISH_SURVEYS,
    PERMISSIONS.VIEW_RESPONSES,
    PERMISSIONS.VIEW_ANALYTICS,
    PERMISSIONS.EXPORT_DATA,
    PERMISSIONS.VIEW_CLIENTS,
    PERMISSIONS.VIEW_PROJECTS
  ],
  user: [
    PERMISSIONS.VIEW_SURVEYS,
    PERMISSIONS.SUBMIT_RESPONSES
  ]
} as const

// Utility functions for permission checking
export class PermissionManager {
  static hasPermission(user: AppUser | null, permission: Permission): boolean {
    if (!user || user.isAnonymous) return false
    return user.permissions?.includes(permission) || false
  }
  
  static hasAnyPermission(user: AppUser | null, permissions: Permission[]): boolean {
    if (!user || user.isAnonymous) return false
    return permissions.some(permission => user.permissions?.includes(permission))
  }
  
  static hasAllPermissions(user: AppUser | null, permissions: Permission[]): boolean {
    if (!user || user.isAnonymous) return false
    return permissions.every(permission => user.permissions?.includes(permission))
  }
  
  // Role-based checks
  static isSuperAdmin(user: AppUser | null): boolean {
    return user?.role === 'super_admin'
  }
  
  static isAdmin(user: AppUser | null): boolean {
    return user?.role === 'admin' || user?.role === 'super_admin'
  }
  
  static isOwner(user: AppUser | null): boolean {
    return user?.role === 'owner' || this.isAdmin(user)
  }
  
  static canManageUsers(user: AppUser | null): boolean {
    return this.hasPermission(user, PERMISSIONS.MANAGE_USERS)
  }
  
  static canManageSurveys(user: AppUser | null): boolean {
    return this.hasPermission(user, PERMISSIONS.MANAGE_SURVEYS) || 
           this.hasPermission(user, PERMISSIONS.CREATE_SURVEYS)
  }
  
  static canViewAnalytics(user: AppUser | null): boolean {
    return this.hasPermission(user, PERMISSIONS.VIEW_ANALYTICS)
  }
  
  static canSendInvites(user: AppUser | null): boolean {
    return this.hasPermission(user, PERMISSIONS.SEND_INVITES)
  }
  
  static canAccessAdminPanel(user: AppUser | null): boolean {
    return this.isOwner(user)
  }
  
  // Get user's accessible navigation items
  static getAccessibleNavItems(user: AppUser | null) {
    const navItems = []
    
    if (!user || user.isAnonymous) {
      return [
        { name: 'Surveys', href: '/surveys', permission: null }
      ]
    }
    
    // Always accessible for authenticated users
    navItems.push({ name: 'Dashboard', href: '/dashboard', permission: null })
    
    if (this.canManageSurveys(user)) {
      navItems.push({ name: 'Surveys', href: '/admin/surveys', permission: PERMISSIONS.VIEW_SURVEYS })
    }
    
    if (this.canViewAnalytics(user)) {
      navItems.push({ name: 'Analytics', href: '/admin/analytics', permission: PERMISSIONS.VIEW_ANALYTICS })
    }
    
    if (this.canManageUsers(user)) {
      navItems.push({ name: 'Users', href: '/admin/users', permission: PERMISSIONS.MANAGE_USERS })
    }
    
    if (this.isAdmin(user)) {
      navItems.push({ name: 'Clients', href: '/admin/clients', permission: PERMISSIONS.MANAGE_CLIENTS })
      navItems.push({ name: 'Projects', href: '/admin/projects', permission: PERMISSIONS.MANAGE_PROJECTS })
    }
    
    if (this.isSuperAdmin(user)) {
      navItems.push({ name: 'System', href: '/admin/system', permission: PERMISSIONS.MANAGE_SYSTEM })
    }
    
    return navItems
  }
}

// Export for easy access
export const {
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  isSuperAdmin,
  isAdmin,
  isOwner,
  canManageUsers,
  canManageSurveys,
  canViewAnalytics,
  canSendInvites,
  canAccessAdminPanel,
  getAccessibleNavItems
} = PermissionManager
