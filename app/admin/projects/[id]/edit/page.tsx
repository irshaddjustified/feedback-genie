'use client'

import AdminAuthGuard from '@/components/auth/AdminAuthGuard'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  ArrowLeft,
  Loader2,
  Save,
  Trash2
} from 'lucide-react'
import { apiClient } from '@/lib/api-client'
import { toast } from 'sonner'

export default function EditProjectPage() {
  const params = useParams()
  const router = useRouter()
  const projectId = params.id as string
  
  const [project, setProject] = useState<any>(null)
  const [clients, setClients] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    clientId: '',
    startDate: '',
    endDate: '',
    status: 'ACTIVE'
  })

  useEffect(() => {
    if (projectId) {
      loadProject()
      loadClients()
    }
  }, [projectId])

  const loadProject = async () => {
    try {
      const projectData = await apiClient.projects.getById(projectId)
      setProject(projectData)
      setFormData({
        name: projectData.name || '',
        description: projectData.description || '',
        clientId: projectData.clientId || '',
        startDate: projectData.startDate 
          ? new Date(projectData.startDate.seconds * 1000).toISOString().split('T')[0] 
          : '',
        endDate: projectData.endDate 
          ? new Date(projectData.endDate.seconds * 1000).toISOString().split('T')[0] 
          : '',
        status: projectData.status || 'ACTIVE'
      })
    } catch (error: any) {
      toast.error('Failed to load project: ' + (error?.message || 'Unknown error'))
      router.push('/admin/projects')
    }
  }

  const loadClients = async () => {
    try {
      const clientsData = await apiClient.clients.getAll()
      setClients(clientsData)
    } catch (error: any) {
      toast.error('Failed to load clients: ' + (error?.message || 'Unknown error'))
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast.error('Project name is required')
      return
    }

    if (!formData.clientId) {
      toast.error('Please select a client')
      return
    }

    setIsSubmitting(true)
    try {
      await apiClient.projects.update(projectId, {
        ...formData,
        startDate: formData.startDate ? new Date(formData.startDate) : null,
        endDate: formData.endDate ? new Date(formData.endDate) : null
      })
      toast.success('Project updated successfully!')
      router.push('/admin/projects')
    } catch (error: any) {
      toast.error('Failed to update project: ' + (error?.message || 'Unknown error'))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete "${project.name}"? This will also delete all associated surveys and responses. This action cannot be undone.`)) {
      return
    }

    try {
      await apiClient.projects.delete(projectId)
      toast.success('Project deleted successfully!')
      router.push('/admin/projects')
    } catch (error: any) {
      toast.error('Failed to delete project: ' + (error?.message || 'Unknown error'))
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
          <p className="text-muted-foreground">Loading project...</p>
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
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/admin/projects')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Projects
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Edit Project</h1>
              <p className="text-sm text-muted-foreground">
                Update project information
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="destructive"
              onClick={handleDelete}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Project
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Update Project
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      <div className="p-6 max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Project Information</CardTitle>
            <CardDescription>
              Update the project details below
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Client Selection */}
            <div className="space-y-2">
              <Label htmlFor="client">Client *</Label>
              <Select value={formData.clientId} onValueChange={(value) => setFormData({ ...formData, clientId: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a client" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map(client => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Project Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Project Name *</Label>
              <Input
                id="name"
                placeholder="e.g., Website Redesign"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Project description..."
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date *</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                />
              </div>
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label>Project Status</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="ON_HOLD">On Hold</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                  <SelectItem value="ARCHIVED">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Project Stats */}
        {project && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Project Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {project.surveyCount || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Surveys</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {project.responseCount || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Responses</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {project.createdAt ? new Date(project.createdAt.seconds * 1000).toLocaleDateString() : '-'}
                  </div>
                  <div className="text-sm text-muted-foreground">Created On</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
      </div>
    </AdminAuthGuard>
  )
}
