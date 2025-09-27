'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AdminAuthGuard from '@/components/auth/AdminAuthGuard'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search,
  Folder,
  Loader2,
  Calendar,
  FileText,
  Building2
} from 'lucide-react'
import Link from 'next/link'
import { apiClient } from '@/lib/api-client'
import { toast } from 'sonner'

export default function ProjectsManagement() {
  const router = useRouter()
  const [projects, setProjects] = useState<any[]>([])
  const [clients, setClients] = useState<any[]>([])
  const [filteredProjects, setFilteredProjects] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedClient, setSelectedClient] = useState<string>('all')
  const [isLoading, setIsLoading] = useState(true)

  // Load projects and clients
  useEffect(() => {
    loadData()
  }, [])

  // Filter projects based on search term and selected client
  useEffect(() => {
    let filtered = projects

    // Filter by client
    if (selectedClient !== 'all') {
      filtered = filtered.filter(project => project.clientId === selectedClient)
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(project =>
        project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredProjects(filtered)
  }, [searchTerm, selectedClient, projects])

  const loadData = async () => {
    try {
      setIsLoading(true)
      
      // Load projects and clients in parallel
      const [projectsData, clientsData] = await Promise.all([
        apiClient.projects.getAll(),
        apiClient.clients.getAll()
      ])
      
      // Enrich projects with client information
      const enrichedProjects = projectsData.map(project => {
        const client = clientsData.find(c => c.id === project.clientId)
        return {
          ...project,
          clientName: client?.name || 'Unknown Client'
        }
      })
      
      setProjects(enrichedProjects)
      setClients(clientsData)
      setFilteredProjects(enrichedProjects)
    } catch (error: any) {
      toast.error('Failed to load data: ' + (error?.message || 'Unknown error'))
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteProject = async (project: any) => {
    if (!confirm(`Are you sure you want to delete "${project.name}"? This will also delete all associated surveys and responses.`)) {
      return
    }

    try {
      await apiClient.projects.delete(project.id)
      toast.success('Project deleted successfully!')
      loadData()
    } catch (error: any) {
      toast.error('Failed to delete project: ' + (error?.message || 'Unknown error'))
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800'
      case 'COMPLETED': return 'bg-blue-100 text-blue-800'
      case 'ON_HOLD': return 'bg-yellow-100 text-yellow-800'
      case 'ARCHIVED': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
          <p className="text-muted-foreground">Loading projects...</p>
        </div>
      </div>
    )
  }

  return (
    <AdminAuthGuard>
      <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b">
        <div className="flex h-16 items-center justify-between px-6">
          <div>
            <h1 className="text-2xl font-bold">Projects Management</h1>
            <p className="text-sm text-muted-foreground">
              Manage all projects across clients
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button asChild variant="outline">
              <Link href="/admin/clients">
                <Building2 className="h-4 w-4 mr-2" />
                Manage Clients
              </Link>
            </Button>
            <Button asChild>
              <Link href="/admin/projects/create">
                <Plus className="h-4 w-4 mr-2" />
                Add Project
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between gap-4">
              {/* Search */}
              <div className="flex items-center gap-2 flex-1">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search projects by name or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
              </div>

              {/* Client Filter */}
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Client:</span>
                <Select value={selectedClient} onValueChange={setSelectedClient}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Clients</SelectItem>
                    {clients.map(client => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Projects Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Folder className="h-5 w-5" />
              Projects ({filteredProjects.length})
            </CardTitle>
            <CardDescription>
              All projects across your organization
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredProjects.length === 0 ? (
              <div className="text-center py-8">
                <Folder className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-lg font-medium mb-2">No projects found</p>
                <p className="text-muted-foreground mb-4">
                  {searchTerm || selectedClient !== 'all' 
                    ? 'Try adjusting your filters' 
                    : 'Get started by adding your first project'
                  }
                </p>
                {!searchTerm && selectedClient === 'all' && (
                  <Button asChild>
                    <Link href="/admin/projects/create">
                      <Plus className="h-4 w-4 mr-2" />
                      Add First Project
                    </Link>
                  </Button>
                )}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Project Name</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>End Date</TableHead>
                    <TableHead>Surveys</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProjects.map((project) => (
                    <TableRow key={project.id}>
                      <TableCell className="font-medium">
                        <div>
                          <div className="font-medium">{project.name}</div>
                          {project.description && (
                            <div className="text-sm text-muted-foreground max-w-xs truncate">
                              {project.description}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {project.clientName}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(project.status)}>
                          {project.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {project.startDate ? new Date(project.startDate.seconds * 1000).toLocaleDateString() : '-'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {project.endDate ? new Date(project.endDate.seconds * 1000).toLocaleDateString() : '-'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {project.surveyCount || 0} surveys
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center gap-2 justify-end">
                          <Button
                            variant="outline"
                            size="sm"
                            asChild
                          >
                            <Link href={`/admin/projects/${project.id}/surveys`}>
                              <FileText className="h-4 w-4 mr-1" />
                              Surveys
                            </Link>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            asChild
                          >
                            <Link href={`/admin/projects/${project.id}/edit`}>
                              <Edit className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteProject(project)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
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
    </AdminAuthGuard>
  )
}
