"use client"

import { Navigation } from "@/components/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Eye, BarChart3, Calendar, ExternalLink, Loader2 } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { apiClient } from "@/lib/api-client"
import { toast } from "sonner"

export default function SurveysPage() {
  const router = useRouter()
  const [requiredAuth, setrequiredAuth] = useState<any>(true)
  const [surveys, setSurveys] = useState<any[]>([])
  const [responses, setResponses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const [surveysData, responsesData] = await Promise.all([
          apiClient.surveys.getAll(),
          apiClient.responses.getAll()
        ])
        setSurveys(surveysData)
        setResponses(responsesData)
      } catch (error) {
        console.error('Failed to load surveys:', error)
        toast.error('Failed to load surveys')
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const getSurveyStats = (surveyId: string) => {
    const surveyResponses = responses.filter((r) => r.surveyId === surveyId)
    const positiveCount = surveyResponses.filter((r) => 
      r.aiAnalysis?.sentimentLabel === 'POSITIVE' || r.aiAnalysis?.sentimentLabel === 'VERY_POSITIVE'
    ).length
    return {
      totalResponses: surveyResponses.length,
      positiveRate: surveyResponses.length > 0 ? Math.round((positiveCount / surveyResponses.length) * 100) : 0,
    }
  }

  const handleClick = async (surveyId: any) => {
    if (requiredAuth) {
      router.push(`/public/auth?redirect=${encodeURIComponent(`/public/${surveyId}`)}`);
    } else {
      router.push(`/public/${surveyId}`);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Surveys</h1>
              <p className="text-muted-foreground">Manage and monitor your feedback collection</p>
            </div>
            <Link href="/admin/surveys/create">
              <Button>Create New Survey</Button>
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading surveys...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {surveys.map((survey) => {
              const stats = getSurveyStats(survey.id)
              return (
                <Card key={survey.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg mb-2">{survey.title || survey.name || 'Untitled Survey'}</CardTitle>
                        <CardDescription className="mb-3">{survey.description || 'No description provided'}</CardDescription>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4" />
                            <span>{survey.createdAt ? new Date(survey.createdAt).toLocaleDateString() : 'N/A'}</span>
                          </div>
                          <Badge variant={survey.status === 'PUBLISHED' ? "default" : "secondary"}>
                            {survey.status || 'DRAFT'}
                          </Badge>
                          <Badge variant="outline">{survey.type || 'CUSTOM'}</Badge>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Stats */}
                      <div className="grid grid-cols-3 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-primary">{survey.questions?.length || 0}</div>
                          <div className="text-xs text-muted-foreground">Questions</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-primary">{stats.totalResponses}</div>
                          <div className="text-xs text-muted-foreground">Responses</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-primary">{stats.positiveRate}%</div>
                          <div className="text-xs text-muted-foreground">Positive</div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex space-x-2 pt-4 border-t">
                        <Link href={`/admin/surveys/${survey.id}/builder`} className="flex-1">
                          <Button variant="outline" className="w-full bg-transparent">
                            <Eye className="h-4 w-4 mr-2" />
                            Edit Survey
                          </Button>
                        </Link>
                        <Link href={`/admin/surveys/${survey.id}/responses`} className="flex-1">
                          <Button variant="outline" className="w-full bg-transparent">
                            <BarChart3 className="h-4 w-4 mr-2" />
                            Analytics
                          </Button>
                        </Link>
                        <Link href={`/feedback/${survey.shareLink}`} target="_blank" className="flex-1">
                          <Button className="w-full">
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Public Link
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

        {/* Empty State */}
        {!loading && surveys.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No surveys yet</h3>
              <p className="text-muted-foreground mb-4">Create your first survey to start collecting feedback</p>
              <Link href="/admin/surveys/create">
                <Button>Create Survey</Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
