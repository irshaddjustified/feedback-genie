import { NextRequest, NextResponse } from 'next/server'
import { createContext } from '@/lib/context'
import { database } from '@/lib/prisma'
import { aiService } from '@/lib/ai/ai-service'

// Type definitions for database objects
interface Survey {
  id: string
  title: string
  projectId: string
  status: string
  createdAt?: string
  updatedAt?: string
  [key: string]: any
}

interface Response {
  id: string
  surveyId: string
  responseData: Record<string, any>
  completionRate?: number
  createdAt?: string
  [key: string]: any
}

interface Project {
  id: string
  name: string
  clientId?: string
  [key: string]: any
}

interface MetricsResponse {
  totalSurveys: number
  totalResponses: number
  avgSentiment: number
  completionRate: number
  sentimentDistribution: {
    positive: number
    neutral: number
    negative: number
  }
  criticalIssues: Array<{
    id: string
    text: string
    sentiment: number
    survey: string
    timestamp: string
  }>
  recentActivity: Array<{
    id: string
    type: 'response_created' | 'survey_published' | 'project_completed'
    description: string
    timestamp: string
    surveyTitle?: string
    projectName?: string
  }>
}

export async function GET(request: NextRequest) {
  try {
    const context = await createContext(request)
    
    if (!context.session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')
    const clientId = searchParams.get('clientId')
    const organizationId = searchParams.get('organizationId')

    // Get all surveys (filtered by project if specified)
    let surveys = (await database.surveys.findMany()) as Survey[]
    if (projectId && projectId !== 'all') {
      surveys = surveys.filter(survey => survey.projectId === projectId)
    }

    // Get all responses
    const allResponses = (await database.responses.findMany()) as Response[]
    
    // Filter responses by surveys in scope
    const surveyIds = new Set(surveys.map(s => s.id))
    const responses = allResponses.filter(r => surveyIds.has(r.surveyId))

    // Get projects for filtering and activity
    const projects = (await database.projects.findMany()) as Project[]

    // Calculate basic metrics
    const totalSurveys = surveys.length
    const totalResponses = responses.length
    
    // Calculate completion rate
    const completedResponses = responses.filter(r => (r.completionRate || 0) >= 80)
    const completionRate = totalResponses > 0 ? completedResponses.length / totalResponses : 0

    // Analyze sentiments and identify critical issues
    let sentimentSum = 0
    let sentimentCount = 0
    const sentimentDistribution = { positive: 0, neutral: 0, negative: 0 }
    const criticalIssues: MetricsResponse['criticalIssues'] = []

    // Process responses for sentiment analysis
    for (const response of responses.slice(-50)) { // Analyze latest 50 for performance
      try {
        if (response.responseData && typeof response.responseData === 'object') {
          const responseData = response.responseData as Record<string, any>
          
          // Extract text responses for sentiment analysis
          for (const [key, value] of Object.entries(responseData)) {
            if (typeof value === 'string' && value.length > 10) {
              try {
                const sentimentResult = await aiService.analyzeSentiment(value)
                
                sentimentSum += sentimentResult.score
                sentimentCount++

                // Categorize sentiment
                if (sentimentResult.score >= 0.6) {
                  sentimentDistribution.positive++
                } else if (sentimentResult.score <= 0.4) {
                  sentimentDistribution.negative++
                } else {
                  sentimentDistribution.neutral++
                }

                // Identify critical issues (very negative sentiment)
                if (sentimentResult.score <= 0.3 && sentimentResult.confidence >= 0.7) {
                  const survey = surveys.find(s => s.id === response.surveyId)
                  criticalIssues.push({
                    id: `${response.id}-${key}`,
                    text: value.length > 200 ? value.substring(0, 200) + '...' : value,
                    sentiment: sentimentResult.score,
                    survey: survey?.title || 'Unknown Survey',
                    timestamp: response.createdAt || new Date().toISOString()
                  })
                }
              } catch (aiError) {
                console.warn('AI analysis failed for response:', aiError)
                // Continue without AI analysis for this response
                sentimentCount++
                sentimentSum += 0.5 // Neutral fallback
                sentimentDistribution.neutral++
              }
            }
          }
        }
      } catch (error) {
        console.warn('Error processing response for sentiment:', error)
      }
    }

    const avgSentiment = sentimentCount > 0 ? sentimentSum / sentimentCount : 0.5

    // Sort critical issues by severity (lowest sentiment first)
    criticalIssues.sort((a, b) => a.sentiment - b.sentiment)

    // Generate recent activity
    const recentActivity: MetricsResponse['recentActivity'] = []
    
    // Add recent responses
    const recentResponses = responses
      .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
      .slice(0, 15)
    
    for (const response of recentResponses) {
      const survey = surveys.find(s => s.id === response.surveyId)
      const project = projects.find(p => p.id === survey?.projectId)
      
      recentActivity.push({
        id: response.id,
        type: 'response_created',
        description: `New response received for "${survey?.title || 'Unknown Survey'}"`,
        timestamp: response.createdAt || new Date().toISOString(),
        surveyTitle: survey?.title,
        projectName: project?.name
      })
    }

    // Add recent surveys
    const recentSurveys = surveys
      .filter(s => s.status === 'PUBLISHED')
      .sort((a, b) => new Date(b.updatedAt || b.createdAt || 0).getTime() - new Date(a.updatedAt || a.createdAt || 0).getTime())
      .slice(0, 5)

    for (const survey of recentSurveys) {
      const project = projects.find(p => p.id === survey.projectId)
      recentActivity.push({
        id: survey.id,
        type: 'survey_published',
        description: `Survey "${survey.title}" was published`,
        timestamp: survey.updatedAt || survey.createdAt || new Date().toISOString(),
        surveyTitle: survey.title,
        projectName: project?.name
      })
    }

    // Sort all activity by timestamp (most recent first)
    recentActivity.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    const metrics: MetricsResponse = {
      totalSurveys,
      totalResponses,
      avgSentiment,
      completionRate,
      sentimentDistribution,
      criticalIssues: criticalIssues.slice(0, 10), // Top 10 critical issues
      recentActivity: recentActivity.slice(0, 20) // Top 20 activities
    }
    
    return NextResponse.json(metrics)
  } catch (error) {
    console.error('Error calculating metrics:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
