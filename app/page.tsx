"use client"

import { useState, useTransition } from "react"
import { Navigation } from "@/components/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { mockResponses, mockSurveys } from "@/lib/mock-data"
import { generateInsights } from "@/lib/ai-service"
import { BarChart3, FileText, TrendingUp, Users, Eye, Sparkles, Settings } from "lucide-react"
import Link from "next/link"

export default function Dashboard() {
  const [insights, setInsights] = useState<string>("")
  const [isPending, startTransition] = useTransition()

  const totalSurveys = mockSurveys.length
  const totalResponses = mockResponses.length
  const activeSurveys = mockSurveys.filter((s) => s.isActive).length
  const positiveResponses = mockResponses.filter((r) => r.sentiment === "positive").length
  const responseRate = Math.round((positiveResponses / totalResponses) * 100)

  const handleGenerateInsights = () => {
    startTransition(async () => {
      try {
        const aiInsights = await generateInsights(mockResponses)
        setInsights(aiInsights)
      } catch (error) {
        setInsights("Unable to generate insights at this time.")
      }
    })
  }

  const recentResponses = mockResponses.sort((a, b) => b.submittedAt.getTime() - a.submittedAt.getTime()).slice(0, 5)

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2 text-balance">Dashboard</h1>
          <p className="text-muted-foreground">Monitor your feedback collection and insights</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Surveys</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalSurveys}</div>
              <p className="text-xs text-muted-foreground">{activeSurveys} active</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Responses</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalResponses}</div>
              <p className="text-xs text-muted-foreground">Across all surveys</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Positive Sentiment</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{responseRate}%</div>
              <p className="text-xs text-muted-foreground">{positiveResponses} positive responses</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Surveys</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeSurveys}</div>
              <p className="text-xs text-muted-foreground">Currently collecting feedback</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* AI Insights */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <span>AI Insights</span>
              </CardTitle>
              <CardDescription>Get AI-powered analysis of your feedback data</CardDescription>
            </CardHeader>
            <CardContent>
              {insights ? (
                <div className="space-y-4">
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm leading-relaxed text-pretty">{insights}</p>
                  </div>
                  <Button onClick={handleGenerateInsights} disabled={isPending} variant="outline" size="sm">
                    {isPending ? "Generating..." : "Refresh Insights"}
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">Generate AI-powered insights from your feedback data</p>
                  <Button onClick={handleGenerateInsights} disabled={isPending}>
                    {isPending ? "Generating..." : "Generate Insights"}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Responses */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Responses</CardTitle>
              <CardDescription>Latest feedback submissions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentResponses.map((response) => (
                  <div key={response.id} className="flex items-start justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-sm font-medium">{response.surveyName}</span>
                        <Badge
                          variant={
                            response.sentiment === "positive"
                              ? "default"
                              : response.sentiment === "negative"
                                ? "destructive"
                                : "secondary"
                          }
                          className="text-xs"
                        >
                          {response.sentiment}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{response.submittedAt.toLocaleDateString()}</p>
                      {response.aiInsights && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{response.aiInsights}</p>
                      )}
                    </div>
                    <Link href={`/survey/${response.surveyId}`}>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Get started with common tasks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                <Link href="/builder">
                  <Button>
                    <Settings className="h-4 w-4 mr-2" />
                    Create New Survey
                  </Button>
                </Link>
                <Link href="/surveys">
                  <Button variant="outline">
                    <FileText className="h-4 w-4 mr-2" />
                    View All Surveys
                  </Button>
                </Link>
                <Button variant="outline" onClick={handleGenerateInsights} disabled={isPending}>
                  <Sparkles className="h-4 w-4 mr-2" />
                  {isPending ? "Generating..." : "AI Analysis"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
