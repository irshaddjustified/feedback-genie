"use client"

import { Navigation } from "@/components/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Eye, BarChart3, Calendar, ExternalLink } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase"
import { collection, getDocs } from "firebase/firestore"

export default function SurveysPage() {
  const router = useRouter();
  const [surveys, setSurveys] = useState<any[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [responses, setResponses] = useState<any[]>([])

  useEffect(() => {
    const fetchSurveys = async () => {
      try {
        const snap = await getDocs(collection(db, "surveys"))
        const list = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
        setSurveys(list)
      } catch (e) {
        console.error("Failed to load surveys:", e)
      } finally {
        setLoading(false)
      }
    }
    fetchSurveys()
  }, [])

  useEffect(() => {
    const fetchResponses = async () => {
      try {
        const snap = await getDocs(collection(db, "responses"))
        const list = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
        setResponses(list)
      } catch (e) {
        console.error("Failed to load responses:", e)
      }
    }
    fetchResponses()
  }, [])

  const getSurveyStats = (_surveyId: string) => {
    const list = responses.filter((r) => r.surveyId === _surveyId)
    const positiveCount = list.filter((r) => r.sentiment === "positive").length
    return {
      totalResponses: list.length,
      positiveCount,
      positiveRate: list.length > 0 ? Math.round((positiveCount / list.length) * 100) : 0,
    }
  }

  const handleClick = async (survey: any) => {
    const requiresAuth = !!survey.authenticationRequired
    if (requiresAuth) {
      router.push(`/public/auth?redirect=${encodeURIComponent(`/public/${survey.id}`)}`);
    } else {
      router.push(`/public/${survey.id}`);
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
            <Link href="/builder">
              <Button>Create New Survey</Button>
            </Link>
          </div>
        </div>

        {loading ? (
          <Card>
            <CardContent className="text-center py-12">Loading surveys...</CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {surveys.map((survey) => {
              const stats = getSurveyStats(survey.id as string)
              return (
                <Card key={survey.id as string}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg mb-2">{survey.surveyName}</CardTitle>
                        <CardDescription className="mb-3">{survey.surveyDescription}</CardDescription>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4" />
                            <span>{
                              // createdAt may be a Date or Firestore Timestamp
                              survey.createdAt?.toDate ? survey.createdAt.toDate().toLocaleDateString() :
                              survey.createdAt ? new Date(survey.createdAt).toLocaleDateString() : ""
                            }</span>
                          </div>
                          <Badge variant="outline">{survey.surveyType}</Badge>
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
                        <Link href={`/survey/${survey.id}`} className="flex-1">
                          <Button variant="outline" className="w-full bg-transparent">
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </Button>
                        </Link>
                        {/* <Link href={`/survey/${survey.id}/responses`} className="flex-1">
                          <Button variant="outline" className="w-full bg-transparent">
                            <BarChart3 className="h-4 w-4 mr-2" />
                            Analytics
                          </Button>
                        </Link> */}
                        <Button className="w-full flex-1" onClick={() => handleClick(survey)}>
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Public Link
                        </Button>
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
              <Link href="/builder">
                <Button>Create Survey</Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
