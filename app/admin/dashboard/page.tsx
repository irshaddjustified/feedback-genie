'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  FileText,
  Users,
  TrendingUp,
  AlertCircle,
  MessageSquare,
  BarChart3,
  Plus,
  Eye,
  Sparkles,
  QrCode,
  MessageCircle
} from 'lucide-react'
import Link from 'next/link'
import { apiClient } from '@/lib/api-client'
import { toast } from 'sonner'
import { SurveyQRDialog } from '@/components/survey/SurveyQRDialog'
function DashboardContent() {
  const [user, setUser] = useState<any>(null)
  const [userLoading, setUserLoading] = useState(true)
  const router = useRouter()
  const [selectedOrganization, setSelectedOrganization] = useState<string>('all')
  const [selectedClient, setSelectedClient] = useState<string>('all')
  const [selectedProject, setSelectedProject] = useState<string>('all')
  const [metrics, setMetrics] = useState<any>(null)
  const [recentActivity, setRecentActivity] = useState<any[]>([])
  const [organizations, setOrganizations] = useState<any[]>([])
  const [clients, setClients] = useState<any[]>([])
  const [projects, setProjects] = useState<any[]>([])
  const [surveys, setSurveys] = useState<any[]>([])
  const [filteredClients, setFilteredClients] = useState<any[]>([])
  const [filteredProjects, setFilteredProjects] = useState<any[]>([])
  const [filteredSurveys, setFilteredSurveys] = useState<any[]>([])
  const [metricsLoading, setMetricsLoading] = useState(true)
  const [loadingData, setLoadingData] = useState(true)

  // Check session on load
  useEffect(() => {
    const session = localStorage.getItem('admin-session')
    if (session) {
      const userData = JSON.parse(session)
      setUser(userData)
    } else {
      // For development, set a mock user if no session exists
      setUser({
        email: 'admin@company.com',
        displayName: 'Admin User',
        role: 'admin'
      })
    }
    setUserLoading(false)
  }, [])

  // Load initial data
  useEffect(() => {
    if (!user) return

    const loadDashboardData = async () => {
      try {
        setLoadingData(true)

        // Load organizations
        const organizationsData = await apiClient.organizations.getAll()
        setOrganizations(organizationsData)

        // Load clients
        const clientsData = await apiClient.clients.getAll()
        setClients(clientsData)
        setFilteredClients(clientsData) // Initially show all clients

        // Load all projects
        const projectsData = await apiClient.projects.getAll()
        setProjects(projectsData)
        setFilteredProjects(projectsData) // Initially show all projects

        // Load all surveys
        const surveysData = await apiClient.surveys.getAll()
        setSurveys(surveysData)
        setFilteredSurveys(surveysData) // Initially show all surveys
        
        // Load metrics with AI analysis
        const metricsData = await apiClient.metrics.getAll()
        setMetrics(metricsData)
        setRecentActivity(metricsData.recentActivity || [])
        
      } catch (error) {
        console.error('Failed to load dashboard data:', error)
        toast.error('Failed to load dashboard data')
      } finally {
        setLoadingData(false)
        setMetricsLoading(false)
      }
    }

    loadDashboardData()
  }, [user])

  // Filter clients when organization selection changes
  useEffect(() => {
    if (selectedOrganization === 'all') {
      setFilteredClients(clients)
    } else {
      const filtered = clients.filter(client => client.organizationId === selectedOrganization)
      setFilteredClients(filtered)
    }
    // Reset downstream selections when organization changes
    setSelectedClient('all')
    setSelectedProject('all')
  }, [selectedOrganization, clients])

  // Filter projects when client selection changes
  useEffect(() => {
    if (selectedClient === 'all') {
      const baseProjects = selectedOrganization === 'all' ? projects :
        projects.filter(project => {
          const client = clients.find(c => c.id === project.clientId)
          return client && client.organizationId === selectedOrganization
        })
      setFilteredProjects(baseProjects)
    } else {
      const filtered = projects.filter(project => project.clientId === selectedClient)
      setFilteredProjects(filtered)
    }
    // Reset project selection when client changes
    setSelectedProject('all')
  }, [selectedClient, projects, selectedOrganization, clients])

  // Filter surveys when project selection changes
  useEffect(() => {
    if (selectedProject === 'all') {
      // Show surveys from filtered projects
      if (filteredProjects.length === 0) {
        // If no projects are filtered, show all surveys
        setFilteredSurveys(surveys)
      } else {
        // Show surveys only from filtered projects
        const projectIds = filteredProjects.map(p => p.id)
        const filtered = surveys.filter(survey => projectIds.includes(survey.projectId))
        setFilteredSurveys(filtered)
      }
    } else {
      // Show surveys from specific project
      const filtered = surveys.filter(survey => survey.projectId === selectedProject)
      setFilteredSurveys(filtered)
    }
  }, [selectedProject, surveys, filteredProjects])

  // Reload metrics when project filter changes
  useEffect(() => {
    if (!user || loadingData) return

    const loadFilteredMetrics = async () => {
      try {
        setMetricsLoading(true)
        
        // Load metrics with current filters
        const filters: any = {}
        if (selectedProject !== 'all') filters.projectId = selectedProject
        if (selectedClient !== 'all') filters.clientId = selectedClient
        if (selectedOrganization !== 'all') filters.organizationId = selectedOrganization
        
        const filteredMetrics = await apiClient.metrics.getAll(filters)
        setMetrics(filteredMetrics)
        setRecentActivity(filteredMetrics.recentActivity || [])
        
      } catch (error) {
        console.error('Failed to load filtered metrics:', error)
        toast.error('Failed to load metrics')
      } finally {
        setMetricsLoading(false)
      }
    }

    loadFilteredMetrics()
  }, [selectedProject, filteredSurveys.length, user, recentActivity.length, loadingData])

  const handleGenerateInsights = async () => {
    try {
      // Mock AI insights generation - replace with actual API call when ready
      const mockInsights = {
        summary: 'Overall feedback sentiment has improved by 15% this quarter',
        keyFindings: [
          'Communication quality rated highly across all projects',
          'Timeline adherence needs improvement',
          'Client satisfaction is above industry average'
        ],
        recommendations: [
          'Focus on project timeline management',
          'Continue excellent communication practices'
        ]
      }

      toast.success('AI insights generated successfully!')
      console.log('Generated insights:', mockInsights)
      // Show insights in a dialog or navigate to insights page
    } catch (error: any) {
      toast.error('Failed to generate insights: ' + (error?.message || 'Unknown error'))
    }
  }

  if (userLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b">
        <div className="flex h-16 items-center justify-between px-6">
          <div>
            <h1 className="text-2xl font-bold">Feedback Dashboard</h1>
            <p className="text-sm text-muted-foreground">
              Welcome back, {user?.displayName || user?.email || 'Admin'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button asChild variant="outline">
              <Link href="/admin/clients">
                <Users className="h-4 w-4 mr-2" />
                Manage Clients
              </Link>
            </Button>
            <Button asChild>
              <Link href="/admin/surveys/create">
                <Plus className="h-4 w-4 mr-2" />
                Create Survey
              </Link>
            </Button>
            <Button 
              variant="outline" 
              onClick={() => {
                localStorage.removeItem('admin-session')
                router.push('/auth/login')
                toast.success('Logged out successfully')
              }}
            >
              Logout
            </Button>
          </div>
        </div>
      </div>

        <div className="p-6 space-y-6">
          {/* Organization, Client and Project Filters */}
          <div className="flex items-center gap-6 flex-wrap">
            {/* Organization Filter */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Organization:</label>
              <select
                value={selectedOrganization}
                onChange={(e) => setSelectedOrganization(e.target.value)}
                className="px-3 py-2 border rounded-md bg-background min-w-48"
              >
                <option value="all">All Organizations</option>
                {organizations?.map(org => (
                  <option key={org.id} value={org.id}>
                    {org.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Client Filter */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Client:</label>
              <select
                value={selectedClient}
                onChange={(e) => setSelectedClient(e.target.value)}
                className="px-3 py-2 border rounded-md bg-background min-w-48"
                disabled={selectedOrganization !== 'all' && filteredClients.length === 0}
              >
                <option value="all">
                  {selectedOrganization === 'all' ? 'All Clients' : 'All Clients in Organization'}
                </option>
                {filteredClients?.map(client => (
                  <option key={client.id} value={client.id}>
                    {client.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Project Filter */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Project:</label>
              <select
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                className="px-3 py-2 border rounded-md bg-background min-w-48"
                disabled={selectedClient !== 'all' && filteredProjects.length === 0}
              >
                <option value="all">
                  {selectedClient === 'all' ? 'All Projects' : 'All Projects for Selected Client'}
                </option>
                {filteredProjects?.map(project => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Total Responses"
            value={metrics?.totalResponses || 0}
            icon={<Users className="h-4 w-4" />}
            loading={metricsLoading}
          />
          <MetricCard
            title="Active Surveys"
            value={metrics?.totalSurveys || 0}
            icon={<FileText className="h-4 w-4" />}
            loading={metricsLoading}
          />
          <MetricCard
            title="Average Sentiment"
            value={`${Math.round((metrics?.avgSentiment || 0) * 100)}%`}
            icon={<TrendingUp className="h-4 w-4" />}
            loading={metricsLoading}
            variant={metrics?.avgSentiment ? 
              (metrics.avgSentiment > 0.6 ? 'success' : 
               metrics.avgSentiment > 0.4 ? 'warning' : 'destructive') 
              : undefined}
          />
          <MetricCard
            title="Critical Issues"
            value={metrics?.criticalIssues?.length || 0}
            icon={<AlertCircle className="h-4 w-4" />}
            loading={metricsLoading}
            variant={metrics?.criticalIssues?.length ? 'destructive' : undefined}
          />
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="responses">Recent Activity</TabsTrigger>
            <TabsTrigger value="insights">AI Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Surveys List */}
              <Card>
                <CardHeader>
                  <CardTitle>Surveys</CardTitle>
                  <CardDescription>
                    {filteredSurveys.length > 0 
                      ? `${filteredSurveys.length} survey${filteredSurveys.length !== 1 ? 's' : ''} found`
                      : 'No surveys match the current filters'
                    }
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loadingData ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                      <p className="text-muted-foreground">Loading surveys...</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {filteredSurveys.length > 0 ? filteredSurveys.map((survey) => (
                      <div key={survey.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium">
                              {survey.title || survey.name || 'Untitled Survey'}
                            </span>
                            <Badge variant={survey.status === 'PUBLISHED' ? 'default' : 'secondary'}>
                              {survey.status || 'DRAFT'}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Project: {projects.find(p => p.id === survey.projectId)?.name || 'Unknown'}
                            {survey.createdAt && ` • Created ${new Date(survey.createdAt).toLocaleDateString()}`}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <SurveyQRDialog
                            surveyId={survey.id}
                            shareLink={survey.shareLink}
                            surveyTitle={survey.title || survey.name || 'Untitled Survey'}
                          >
                            <Button variant="ghost" size="sm">
                              <QrCode className="h-4 w-4" />
                            </Button>
                          </SurveyQRDialog>
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/admin/surveys/${survey.id}/builder`}>
                              <FileText className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/feedback/${survey.shareLink}`} target="_blank">
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                        </div>
                      </div>
                    )) : (
                      <div className="text-center py-8">
                        <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground mb-4">No surveys found</p>
                        <Button asChild>
                          <Link href="/admin/surveys/create">
                            <Plus className="h-4 w-4 mr-2" />
                            Create Survey
                          </Link>
                        </Button>
                      </div>
                    )}
                    </div>
                  )}
                </CardContent>
              </Card>

                {/* Recent Activity */}
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>Latest feedback submissions</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {recentActivity?.length > 0 ? recentActivity.slice(0, 5).map((response, index) => (
                        <div key={response.id || index} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-medium">
                                {response.survey?.title || 'Survey Response'}
                              </span>
                              {response.aiAnalysis && (
                                <Badge variant={
                                  response.aiAnalysis.sentimentLabel === 'VERY_POSITIVE' ||
                                    response.aiAnalysis.sentimentLabel === 'POSITIVE' ? 'default' :
                                    response.aiAnalysis.sentimentLabel === 'NEGATIVE' ||
                                      response.aiAnalysis.sentimentLabel === 'VERY_NEGATIVE' ? 'destructive' :
                                      'secondary'
                                }>
                                  {response.aiAnalysis.sentimentLabel}
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {new Date(response.submittedAt).toLocaleDateString()}
                            </p>
                          </div>
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/admin/responses/${response.id}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                        </div>
                      )) : (
                        <p className="text-muted-foreground text-center py-4">No recent activity</p>
                      )}
                    </div>
                  </CardContent>
                </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Common tasks and shortcuts</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button asChild className="w-full justify-start">
                    <Link href="/admin/surveys/create">
                      <Plus className="h-4 w-4 mr-2" />
                      Create New Survey
                    </Link>
                  </Button>
                  <Button variant="outline" asChild className="w-full justify-start">
                    <Link href="/admin/projects/create">
                      <FileText className="h-4 w-4 mr-2" />
                      Add New Project
                    </Link>
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={handleGenerateInsights}
                    className="w-full justify-start"
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate AI Insights
                  </Button>
                  <Button variant="outline" asChild className="w-full justify-start">
                    <Link href="/admin/analytics">
                      <BarChart3 className="h-4 w-4 mr-2" />
                      View Analytics
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Sentiment Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Sentiment Distribution</CardTitle>
                  <CardDescription>Breakdown of feedback sentiment</CardDescription>
                </CardHeader>
                <CardContent>
                  {metricsLoading ? (
                    <div className="space-y-3">
                      <div className="animate-pulse h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="animate-pulse h-4 bg-gray-200 rounded w-1/2"></div>
                      <div className="animate-pulse h-4 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Positive</span>
                        <span className="text-sm text-green-600">
                          {metrics?.sentimentDistribution?.positive || 0}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full" 
                          style={{ 
                            width: `${((metrics?.sentimentDistribution?.positive || 0) / 
                                   ((metrics?.sentimentDistribution?.positive || 0) + 
                                    (metrics?.sentimentDistribution?.neutral || 0) + 
                                    (metrics?.sentimentDistribution?.negative || 0) || 1)) * 100}%` 
                          }}
                        ></div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Neutral</span>
                        <span className="text-sm text-yellow-600">
                          {metrics?.sentimentDistribution?.neutral || 0}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-yellow-600 h-2 rounded-full" 
                          style={{ 
                            width: `${((metrics?.sentimentDistribution?.neutral || 0) / 
                                   ((metrics?.sentimentDistribution?.positive || 0) + 
                                    (metrics?.sentimentDistribution?.neutral || 0) + 
                                    (metrics?.sentimentDistribution?.negative || 0) || 1)) * 100}%` 
                          }}
                        ></div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Negative</span>
                        <span className="text-sm text-red-600">
                          {metrics?.sentimentDistribution?.negative || 0}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-red-600 h-2 rounded-full" 
                          style={{ 
                            width: `${((metrics?.sentimentDistribution?.negative || 0) / 
                                   ((metrics?.sentimentDistribution?.positive || 0) + 
                                    (metrics?.sentimentDistribution?.neutral || 0) + 
                                    (metrics?.sentimentDistribution?.negative || 0) || 1)) * 100}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Critical Issues */}
              <Card>
                <CardHeader>
                  <CardTitle>Critical Issues</CardTitle>
                  <CardDescription>Feedback requiring immediate attention</CardDescription>
                </CardHeader>
                <CardContent>
                  {metricsLoading ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="animate-pulse">
                          <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                          <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                        </div>
                      ))}
                    </div>
                  ) : metrics?.criticalIssues?.length ? (
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {metrics.criticalIssues.map((issue: any, index: number) => (
                        <div key={issue.id} className="p-3 border rounded-lg bg-red-50 border-red-200">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="text-sm font-medium text-red-800 mb-1">
                                {issue.survey}
                              </p>
                              <p className="text-sm text-red-700 leading-relaxed">
                                {issue.text}
                              </p>
                              <div className="flex items-center gap-2 mt-2">
                                <Badge variant="destructive" className="text-xs">
                                  {Math.round(issue.sentiment * 100)}% negative
                                </Badge>
                                <span className="text-xs text-red-600">
                                  {new Date(issue.timestamp).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No critical issues detected</p>
                      <p className="text-sm text-muted-foreground">All feedback sentiment is positive!</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="responses">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest responses and survey activity</CardDescription>
              </CardHeader>
              <CardContent>
                {metricsLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3, 4, 5].map(i => (
                      <div key={i} className="animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    ))}
                  </div>
                ) : recentActivity?.length ? (
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {recentActivity.map((activity: any, index: number) => (
                      <div key={activity.id} className="flex items-start gap-3 p-3 border rounded-lg">
                        <div className={`w-2 h-2 rounded-full mt-2 ${
                          activity.type === 'response_created' ? 'bg-blue-500' :
                          activity.type === 'survey_published' ? 'bg-green-500' : 
                          'bg-gray-500'
                        }`}></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{activity.description}</p>
                          {activity.projectName && (
                            <p className="text-xs text-muted-foreground">
                              Project: {activity.projectName}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground">
                            {new Date(activity.timestamp).toLocaleString()}
                          </p>
                        </div>
                        <Badge variant={
                          activity.type === 'response_created' ? 'default' :
                          activity.type === 'survey_published' ? 'secondary' : 
                          'outline'
                        } className="text-xs">
                          {activity.type.replace('_', ' ')}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No recent activity</p>
                    <p className="text-sm text-muted-foreground">Activity will appear as users submit responses</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="insights">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  AI-Powered Insights
                </CardTitle>
                <CardDescription>
                  Get intelligent analysis of your feedback data
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">
                    Generate AI-powered insights from your feedback data
                  </p>
                  <Button onClick={handleGenerateInsights}>
                    Generate Insights
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default function AdminDashboard() {
  return (
    <ErrorBoundary>
      <DashboardContent />
    </ErrorBoundary>
  )
}

interface MetricCardProps {
  title: string
  value: string | number
  icon: React.ReactNode
  loading?: boolean
  variant?: 'default' | 'success' | 'warning' | 'destructive'
}

function MetricCard({ title, value, icon, loading, variant = 'default' }: MetricCardProps) {
  const variantClasses = {
    default: '',
    success: 'border-green-200 bg-green-50',
    warning: 'border-yellow-200 bg-yellow-50',
    destructive: 'border-red-200 bg-red-50'
  }

  return (
    <Card className={variantClasses[variant]}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-16"></div>
          </div>
        ) : (
          <div className="text-2xl font-bold">{value}</div>
        )}
      </CardContent>
    </Card>
  )
}
