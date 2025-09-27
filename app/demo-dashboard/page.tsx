'use client'

import { useState } from 'react'
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

export default function DemoDashboard() {
  const [selectedFilter, setSelectedFilter] = useState('all')

  // Mock data for demo
  const metrics = {
    totalResponses: 247,
    totalSurveys: 12,
    avgSentiment: 0.82,
    criticalCount: 3
  }

  const surveys = [
    {
      id: '1',
      title: 'Customer Satisfaction Survey Q4',
      status: 'PUBLISHED',
      projectId: 'proj1',
      shareLink: 'csat-q4-2024',
      createdAt: '2024-01-15'
    },
    {
      id: '2', 
      title: 'Employee Feedback - Remote Work',
      status: 'PUBLISHED',
      projectId: 'proj2',
      shareLink: 'emp-remote-2024',
      createdAt: '2024-01-10'
    },
    {
      id: '3',
      title: 'Product Feature Feedback',
      status: 'DRAFT',
      projectId: 'proj1',
      shareLink: 'product-feedback-2024',
      createdAt: '2024-01-05'
    }
  ]

  const recentActivity = [
    {
      id: '1',
      survey: { title: 'Customer Satisfaction Survey Q4' },
      aiAnalysis: { sentimentLabel: 'POSITIVE' },
      submittedAt: '2024-01-20T10:30:00Z'
    },
    {
      id: '2',
      survey: { title: 'Employee Feedback - Remote Work' },
      aiAnalysis: { sentimentLabel: 'VERY_POSITIVE' },
      submittedAt: '2024-01-20T09:15:00Z'
    },
    {
      id: '3',
      survey: { title: 'Product Feature Feedback' },
      aiAnalysis: { sentimentLabel: 'NEUTRAL' },
      submittedAt: '2024-01-19T16:45:00Z'
    }
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b">
        <div className="flex h-16 items-center justify-between px-6">
          <div>
            <h1 className="text-2xl font-bold">Feedback Dashboard</h1>
            <p className="text-sm text-muted-foreground">
              Welcome back, Admin User
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline">
              <Users className="h-4 w-4 mr-2" />
              Manage Clients
            </Button>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Survey
            </Button>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Total Responses"
            value={metrics.totalResponses}
            icon={<Users className="h-4 w-4" />}
          />
          <MetricCard
            title="Active Surveys"
            value={metrics.totalSurveys}
            icon={<FileText className="h-4 w-4" />}
          />
          <MetricCard
            title="Average Sentiment"
            value={`${Math.round(metrics.avgSentiment * 100)}%`}
            icon={<TrendingUp className="h-4 w-4" />}
            variant="success"
          />
          <MetricCard
            title="Critical Issues"
            value={metrics.criticalCount}
            icon={<AlertCircle className="h-4 w-4" />}
            variant={metrics.criticalCount > 0 ? 'destructive' : undefined}
          />
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="responses">Recent Responses</TabsTrigger>
            <TabsTrigger value="insights">AI Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Surveys List */}
              <Card>
                <CardHeader>
                  <CardTitle>Surveys</CardTitle>
                  <CardDescription>
                    {surveys.length} survey{surveys.length !== 1 ? 's' : ''} found
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {surveys.map((survey) => (
                      <div key={survey.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium">
                              {survey.title}
                            </span>
                            <Badge variant={survey.status === 'PUBLISHED' ? 'default' : 'secondary'}>
                              {survey.status}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Created {new Date(survey.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm">
                            <FileText className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
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
                    {recentActivity.map((response) => (
                      <div key={response.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium">
                              {response.survey.title}
                            </span>
                            <Badge variant={
                              response.aiAnalysis.sentimentLabel === 'VERY_POSITIVE' || 
                              response.aiAnalysis.sentimentLabel === 'POSITIVE' ? 'default' :
                              response.aiAnalysis.sentimentLabel === 'NEGATIVE' ||
                              response.aiAnalysis.sentimentLabel === 'VERY_NEGATIVE' ? 'destructive' : 
                              'secondary'
                            }>
                              {response.aiAnalysis.sentimentLabel}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {new Date(response.submittedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
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
                  <Button className="w-full justify-start">
                    <Plus className="h-4 w-4 mr-2" />
                    Create New Survey
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="h-4 w-4 mr-2" />
                    Add New Project
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => alert('AI Insights: Overall sentiment up 15% this quarter!')}
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate AI Insights
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    View Analytics
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
                <div className="space-y-4">
                  {recentActivity.map((response) => (
                    <div key={response.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium">{response.survey.title}</h4>
                        <Badge variant={
                          response.aiAnalysis.sentimentLabel === 'VERY_POSITIVE' || 
                          response.aiAnalysis.sentimentLabel === 'POSITIVE' ? 'default' : 'secondary'
                        }>
                          {response.aiAnalysis.sentimentLabel}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        Submitted on {new Date(response.submittedAt).toLocaleDateString()}
                      </p>
                      <p className="text-sm">
                        "The new features are really helpful and intuitive. Great job on the user experience improvements!"
                      </p>
                    </div>
                  ))}
                </div>
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
                  Intelligent analysis of your feedback data
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-900 mb-2">📈 Sentiment Trends</h4>
                    <p className="text-blue-800 text-sm">
                      Overall sentiment has improved by 15% this quarter, with particularly positive feedback on communication quality.
                    </p>
                  </div>
                  
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-semibold text-green-900 mb-2">✅ Key Strengths</h4>
                    <ul className="text-green-800 text-sm space-y-1">
                      <li>• Communication quality rated highly across projects</li>
                      <li>• Client satisfaction above industry average</li>
                      <li>• Response rate increased by 23%</li>
                    </ul>
                  </div>
                  
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <h4 className="font-semibold text-orange-900 mb-2">⚠️ Areas for Improvement</h4>
                    <ul className="text-orange-800 text-sm space-y-1">
                      <li>• Timeline adherence needs attention</li>
                      <li>• Project scope clarity could be improved</li>
                    </ul>
                  </div>
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
  variant?: 'default' | 'success' | 'warning' | 'destructive'
}

function MetricCard({ title, value, icon, variant = 'default' }: MetricCardProps) {
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
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  )
}
