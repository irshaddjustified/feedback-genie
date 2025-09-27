'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
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
  Sparkles
} from 'lucide-react'
import Link from 'next/link'
import { api } from '@/lib/trpc-client'
import { toast } from 'sonner'

export default function AdminDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [selectedProject, setSelectedProject] = useState<string>('all')
  
  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'loading') return // Still loading
    if (!session) {
      router.push('/auth/login')
      return
    }
  }, [session, status, router])

  // Get dashboard metrics
  const { data: metrics, isLoading: metricsLoading } = api.analytics.dashboard.useQuery(
    { 
      projectId: selectedProject === 'all' ? undefined : selectedProject 
    },
    { enabled: !!session }
  )

  // Get recent responses
  const { data: recentActivity } = api.response.list.useQuery(
    { surveyId: '', limit: 10 },
    { enabled: !!session }
  )

  // Get projects for filter
  const { data: projects } = api.project.list.useQuery(
    { limit: 50 },
    { enabled: !!session }
  )

  const handleGenerateInsights = async () => {
    try {
      const insights = await api.ai.generateInsights.query({
        projectId: selectedProject === 'all' ? undefined : selectedProject
      })
      
      toast.success('AI insights generated successfully!')
      // Show insights in a dialog or navigate to insights page
    } catch (error) {
      toast.error('Failed to generate insights')
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null // Will redirect
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b">
        <div className="flex h-16 items-center justify-between px-6">
          <div>
            <h1 className="text-2xl font-bold">Feedback Dashboard</h1>
            <p className="text-sm text-muted-foreground">
              Welcome back, {session.user?.name || session.user?.email}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button asChild>
              <Link href="/admin/surveys/create">
                <Plus className="h-4 w-4 mr-2" />
                Create Survey
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Project Filter */}
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium">Filter by Project:</label>
          <select 
            value={selectedProject} 
            onChange={(e) => setSelectedProject(e.target.value)}
            className="px-3 py-2 border rounded-md bg-background"
          >
            <option value="all">All Projects</option>
            {projects?.map(project => (
              <option key={project.id} value={project.id}>
                {project.name} ({project.clientName})
              </option>
            ))}
          </select>
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
            value={metrics?.criticalCount || 0}
            icon={<AlertCircle className="h-4 w-4" />}
            loading={metricsLoading}
            variant={metrics?.criticalCount ? 'destructive' : undefined}
          />
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="responses">Recent Responses</TabsTrigger>
            <TabsTrigger value="insights">AI Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Latest feedback submissions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {metrics?.recentResponses?.map((response, index) => (
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
                    ))}
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

          <TabsContent value="responses">
            <Card>
              <CardHeader>
                <CardTitle>Recent Responses</CardTitle>
                <CardDescription>Detailed view of recent feedback submissions</CardDescription>
              </CardHeader>
              <CardContent>
                {/* Response list component would go here */}
                <p className="text-muted-foreground text-center py-8">
                  Response details will be displayed here
                </p>
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
