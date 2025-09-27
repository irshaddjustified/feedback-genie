'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/lib/contexts/AuthContext'
import { PERMISSIONS } from '@/lib/permissions'
import { 
  UserPlus, 
  Mail, 
  Users, 
  Shield, 
  Crown,
  User,
  AlertCircle,
  Check,
  X
} from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

interface User {
  id: string
  email: string
  displayName?: string
  role: 'super_admin' | 'admin' | 'owner' | 'user'
  organizationId?: string
  lastLoginAt?: Date
  createdAt?: Date
}

interface Invitation {
  id: string
  email: string
  role: 'admin' | 'owner' | 'user'
  organizationName?: string
  status: 'pending' | 'accepted' | 'expired'
  createdAt: Date
  expiresAt: Date
}

export default function UsersPage() {
  const { user, canManageUsers, isAdmin, isSuperAdmin } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Invitation form state
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<'owner' | 'admin' | 'user'>('owner')
  const [inviteMessage, setInviteMessage] = useState('')
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false)
  const [inviting, setInviting] = useState(false)

  useEffect(() => {
    if (!canManageUsers) {
      setError('You do not have permission to manage users')
      return
    }
    
    fetchData()
  }, [canManageUsers])

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch users
      const usersResponse = await fetch('/api/users')
      if (usersResponse.ok) {
        const usersData = await usersResponse.json()
        setUsers(usersData.data || [])
      }

      // Fetch invitations
      const invitationsResponse = await fetch('/api/invitations')
      if (invitationsResponse.ok) {
        const invitationsData = await invitationsResponse.json()
        setInvitations(invitationsData.data || [])
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      setError('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const handleInviteUser = async () => {
    if (!inviteEmail || !inviteRole) {
      setError('Please fill in all required fields')
      return
    }

    try {
      setInviting(true)
      setError(null)

      const response = await fetch('/api/invitations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: inviteEmail,
          role: inviteRole,
          organizationId: user?.organizationId || 'default',
          organizationName: user?.organizationDomain || 'Your Organization',
          invitedBy: user?.email,
          message: inviteMessage || `You have been invited to join as ${inviteRole}`
        })
      })

      const data = await response.json()

      if (data.success) {
        setSuccess('Invitation sent successfully!')
        setInviteEmail('')
        setInviteMessage('')
        setInviteDialogOpen(false)
        fetchData() // Refresh data
      } else {
        setError(data.error || 'Failed to send invitation')
      }
    } catch (error) {
      console.error('Error sending invitation:', error)
      setError('Failed to send invitation')
    } finally {
      setInviting(false)
    }
  }

  const handleUpdateUserRole = async (userId: string, newRole: string) => {
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          uid: userId,
          role: newRole,
          organizationId: user?.organizationId
        })
      })

      const data = await response.json()

      if (data.success) {
        setSuccess('User role updated successfully!')
        fetchData() // Refresh data
      } else {
        setError(data.error || 'Failed to update user role')
      }
    } catch (error) {
      console.error('Error updating user role:', error)
      setError('Failed to update user role')
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'super_admin': return <Crown className="h-4 w-4 text-yellow-500" />
      case 'admin': return <Shield className="h-4 w-4 text-blue-500" />
      case 'owner': return <Users className="h-4 w-4 text-green-500" />
      default: return <User className="h-4 w-4 text-gray-500" />
    }
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'super_admin': return 'bg-yellow-100 text-yellow-800'
      case 'admin': return 'bg-blue-100 text-blue-800'
      case 'owner': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (!canManageUsers) {
    return (
      <div className="container mx-auto py-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You do not have permission to access this page.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-muted-foreground">
            Manage users and send invitations to new team members
          </p>
        </div>
        
        <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="h-4 w-4 mr-2" />
              Invite User
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invite New User</DialogTitle>
              <DialogDescription>
                Send an invitation to a new team member. They will receive an email with instructions to join.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="user@company.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="role">Role</Label>
                <Select value={inviteRole} onValueChange={(value: any) => setInviteRole(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="owner">Owner - Can create and manage surveys</SelectItem>
                    {isAdmin && (
                      <SelectItem value="admin">Admin - Full organization access</SelectItem>
                    )}
                    <SelectItem value="user">User - Basic access</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="message">Custom Message (Optional)</Label>
                <Input
                  id="message"
                  placeholder="Welcome to our team!"
                  value={inviteMessage}
                  onChange={(e) => setInviteMessage(e.target.value)}
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setInviteDialogOpen(false)}
                disabled={inviting}
              >
                Cancel
              </Button>
              <Button onClick={handleInviteUser} disabled={inviting}>
                {inviting ? 'Sending...' : 'Send Invitation'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert>
          <Check className="h-4 w-4" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6">
        {/* Current Users */}
        <Card>
          <CardHeader>
            <CardTitle>Current Users</CardTitle>
            <CardDescription>
              Manage existing users and their roles
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-4">Loading users...</div>
            ) : users.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                No users found
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Last Login</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((userItem) => (
                    <TableRow key={userItem.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {userItem.displayName || userItem.email}
                          </div>
                          {userItem.displayName && (
                            <div className="text-sm text-muted-foreground">
                              {userItem.email}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getRoleIcon(userItem.role)}
                          <Badge className={getRoleBadgeColor(userItem.role)}>
                            {userItem.role.replace('_', ' ')}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        {userItem.lastLoginAt 
                          ? new Date(userItem.lastLoginAt).toLocaleDateString()
                          : 'Never'
                        }
                      </TableCell>
                      <TableCell>
                        {userItem.id !== user?.uid && (isSuperAdmin || (isAdmin && userItem.role !== 'admin' && userItem.role !== 'super_admin')) && (
                          <Select
                            defaultValue={userItem.role}
                            onValueChange={(value) => handleUpdateUserRole(userItem.id, value)}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="user">User</SelectItem>
                              <SelectItem value="owner">Owner</SelectItem>
                              {isAdmin && <SelectItem value="admin">Admin</SelectItem>}
                            </SelectContent>
                          </Select>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Pending Invitations */}
        <Card>
          <CardHeader>
            <CardTitle>Pending Invitations</CardTitle>
            <CardDescription>
              Track sent invitations and their status
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-4">Loading invitations...</div>
            ) : invitations.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                No pending invitations
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Expires</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invitations.map((invitation) => (
                    <TableRow key={invitation.id}>
                      <TableCell>{invitation.email}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getRoleIcon(invitation.role)}
                          <Badge className={getRoleBadgeColor(invitation.role)}>
                            {invitation.role}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={invitation.status === 'pending' ? 'default' : 
                                  invitation.status === 'accepted' ? 'default' : 'destructive'}
                        >
                          {invitation.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(invitation.expiresAt).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
