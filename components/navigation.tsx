"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { 
  BarChart3, 
  FileText, 
  Settings, 
  Sparkles, 
  User, 
  LogOut,
  Plus,
  FolderOpen
} from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"

export function Navigation() {
  const pathname = usePathname()
  const { data: session, status } = useSession()

  const publicNavItems = [
    {
      href: "/",
      label: "Home",
      icon: Sparkles,
    },
  ]

  const adminNavItems = [
    {
      href: "/admin/dashboard",
      label: "Dashboard",
      icon: BarChart3,
    },
    {
      href: "/admin/projects",
      label: "Projects",
      icon: FolderOpen,
    },
    {
      href: "/admin/surveys",
      label: "Surveys",
      icon: FileText,
    },
  ]

  const navItems = session ? adminNavItems : publicNavItems

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' })
  }

  return (
    <nav className="border-b bg-card">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link href={session ? "/admin/dashboard" : "/"} className="flex items-center space-x-2">
              <Sparkles className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold text-foreground">FeedbackGenie</span>
            </Link>

            {session && (
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
            {session && (
              <Button asChild size="sm">
                <Link href="/admin/surveys/create">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Survey
                </Link>
              </Button>
            )}
            
            <ThemeToggle />

            {status === 'loading' ? (
              <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse"></div>
            ) : session ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                    <User className="h-4 w-4" />
                    <span className="hidden sm:inline">
                      {session.user?.name || session.user?.email}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href="/admin/dashboard" className="flex items-center">
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/admin/settings" className="flex items-center">
                      <Settings className="h-4 w-4 mr-2" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
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
                  Admin Login
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
