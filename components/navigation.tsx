"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { 
  BarChart3, 
  FileText, 
  Settings, 
  Sparkles, 
  User, 
  LogOut,
  Plus,
  FolderOpen,
  Users,
  Building,
  Wrench,
  MessageCircle
} from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/lib/contexts/AuthContext"
import { PermissionManager } from "@/lib/permissions"

interface NavigationProps {
  hideAdminElements?: boolean
}

export function Navigation({ hideAdminElements = false }: NavigationProps) {
  const pathname = usePathname()
  const { 
    user, 
    loading, 
    signOut,
    isSuperAdmin,
    isAdmin,
    canManageUsers,
    canManageSurveys,
    canViewAnalytics,
    canAccessAdminPanel
  } = useAuth()

  const publicNavItems = [
    {
      href: "/",
      label: "Home",
      icon: Sparkles,
      show: true
    },
    {
      href: "/chat",
      label: "Chat",
      icon: MessageCircle,
    },
    {
      href: "/chat",
      label: "Chat",
      icon: MessageCircle,
    },
  ]

  // Dynamic navigation based on user permissions
  const getNavItems = () => {
    if (!user || user.isAnonymous || !canAccessAdminPanel) {
      return publicNavItems
    }

    const navItems = [
      {
        href: "/admin/dashboard",
        label: "Dashboard",
        icon: BarChart3,
        show: true
      }
    ]

    // if (canViewAnalytics) {
    //   navItems.push({
    //     href: "/admin/analytics",
    //     label: "Analytics",
    //     icon: BarChart3,
    //     show: true
    //   })
    // }

    if (canManageSurveys) {
      navItems.push({
        href: "/surveys",
        label: "Surveys",
        icon: FileText,
        show: true
      })
    }

    if (isAdmin) {
      navItems.push({
        href: "/admin/projects",
        label: "Projects",
        icon: FolderOpen,
        show: true
      })
      
      navItems.push({
        href: "/admin/clients",
        label: "Clients",
        icon: Building,
        show: true
      })
    }

    if (canManageUsers) {
      navItems.push({
        href: "/admin/users",
        label: "Users",
        icon: Users,
        show: true
      })
    }

    if (isSuperAdmin) {
      navItems.push({
        href: "/admin/system",
        label: "System",
        icon: Wrench,
        show: true
      })
    }

    navItems.push({
      href: "/chat",
      label: "Chat",
      icon: MessageCircle,
      show: true
    })

    return navItems.filter(item => item.show)
  }

  const navItems = getNavItems()

  const handleSignOut = async () => {
    try {
      await signOut()
      window.location.href = '/'
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  return (
    <nav className="border-b bg-card">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link href={canAccessAdminPanel ? "/admin/dashboard" : "/"} className="flex items-center space-x-2">
              <Sparkles className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold text-foreground">FeedbackGenie</span>
            </Link>

            {canAccessAdminPanel && (
              <div className="flex space-x-4">
                {navItems.map((item) => {
                  const Icon = item.icon
                  return (
                    <Link key={item.href} href={item.href}>
                      <Button
                        variant={pathname === item.href ? "default" : "ghost"}
                        className="flex items-center space-x-2"
                        size="sm"
                      >
                        <Icon className="h-4 w-4" />
                        <span>{item.label}</span>
                      </Button>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {canManageSurveys && (
              <Button asChild size="sm">
                <Link href="/admin/surveys/create">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Survey
                </Link>
              </Button>
            )}
            
            <ThemeToggle />

            {loading ? (
              <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse"></div>
            ) : user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                    <User className="h-4 w-4" />
                    <span className="hidden sm:inline">
                      {user.displayName || user.email}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <div className="px-2 py-1.5 text-sm font-medium">
                    {user.displayName || user.email}
                    {user.role && (
                      <div className="text-xs text-muted-foreground capitalize">
                        {user.role.replace('_', ' ')}
                      </div>
                    )}
                  </div>
                  
                  {canAccessAdminPanel && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/admin/dashboard" className="flex items-center">
                          <BarChart3 className="h-4 w-4 mr-2" />
                          Dashboard
                        </Link>
                      </DropdownMenuItem>
                      
                      {isAdmin && (
                        <DropdownMenuItem asChild>
                          <Link href="/admin/settings" className="flex items-center">
                            <Settings className="h-4 w-4 mr-2" />
                            Settings
                          </Link>
                        </DropdownMenuItem>
                      )}
                    </>
                  )}
                  
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="flex items-center">
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button asChild size="sm">
                <Link href="/auth/login">
                  <User className="h-4 w-4 mr-2" />
                  Login
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
