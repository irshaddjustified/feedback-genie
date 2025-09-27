'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Briefcase, 
  User, 
  ArrowRight, 
  ArrowLeft, 
  Send, 
  CheckCircle,
  Sparkles,
  HelpCircle,
  Lightbulb,
  Calendar
} from 'lucide-react'
import { api } from '@/lib/trpc-client'
import { toast } from 'sonner'
import { useDebounce } from '@/lib/hooks/useDebounce'

export default function PublicFeedbackPage() {
  const params = useParams()
  const router = useRouter()
  const shareLink = params.shareLink as string
  
  const [currentPage, setCurrentPage] = useState(0)
  const [responses, setResponses] = useState<Record<string, any>>({})
  const [respondentInfo, setRespondentInfo] = useState({
    name: '',
    email: ''
  })
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([])
  const [currentSentiment, setCurrentSentiment] = useState<number>(0)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Get survey data
  const { data: survey, isLoading, error } = api.survey.getByShareLink.useQuery(
    { shareLink },
    { enabled: !!shareLink }
  )

  // Mock survey structure for demo
  const mockSurvey = {
    id: 'demo-survey',
    title: 'Project Feedback Survey',
    description: 'Help us improve by sharing your experience with our recent project',
    project: {
      name: 'Website Redesign',
      clientName: 'TechCorp Inc.'
    },
    pages: [
      {
        name: 'overall',
        elements: [
          {
            name: 'satisfaction',
            type: 'rating',
            title: 'How satisfied are you with the overall project outcome?',
            isRequired: true,
            rateMin: 1,
            rateMax: 10
          },
          {
            name: 'recommendation',
            type: 'radiogroup',
            title: 'Would you recommend our services to others?',
            isRequired: true,
            choices: ['Definitely', 'Probably', 'Not sure', 'Probably not', 'Definitely not']
          }
        ]
      },
      {
        name: 'detailed',
        elements: [
          {
            name: 'strengths',
            type: 'comment',
            title: 'What did you like most about working with us?',
            rows: 4
          },
          {
            name: 'improvements',
            type: 'comment',
            title: 'What areas do you think we could improve?',
            rows: 4
          },
          {
            name: 'future_features',
            type: 'comment',
            title: 'Any suggestions for future enhancements?',
            rows: 4
          }
        ]
      }
    ]
  }

  // Use mock data if no survey found (for demo)
  const displaySurvey = survey || mockSurvey

  // Debounced text analysis
  const debouncedAnalyzeText = useDebounce(async (questionName: string, value: string) => {
    if (value.length < 50) return

    try {
      const analysis = await api.ai.analyzeText.mutate({
        text: value,
        context: 'feedback_response'
      })

      setCurrentSentiment(analysis.sentiment)

      // Show suggestions for negative sentiment
      if (analysis.sentiment < 0.4) {
        setAiSuggestions([
          'Could you provide specific examples to help us understand better?',
          'What would have made this experience better for you?'
        ])
      } else {
        setAiSuggestions([])
      }
    } catch (error) {
      console.error('AI analysis failed:', error)
    }
  }, 1000)

  const handleValueChange = (questionName: string, value: any) => {
    setResponses(prev => ({ ...prev, [questionName]: value }))
    
    // Trigger AI analysis for text inputs
    const question = displaySurvey.pages[currentPage]?.elements.find(q => q.name === questionName)
    if (question?.type === 'comment' && typeof value === 'string') {
      debouncedAnalyzeText(questionName, value)
    }
  }

  const calculateProgress = () => {
    const totalPages = displaySurvey.pages.length
    return Math.round(((currentPage + 1) / totalPages) * 100)
  }

  const calculateCompletionRate = () => {
    let totalQuestions = 0
    let answeredQuestions = 0

    displaySurvey.pages.forEach(page => {
      page.elements.forEach(question => {
        totalQuestions++
        if (responses[question.name]) {
          answeredQuestions++
        }
      })
    })

    return totalQuestions > 0 ? answeredQuestions / totalQuestions : 0
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    
    try {
      if (survey?.id) {
        // Real API call
        await api.response.submit.mutate({
          surveyId: survey.id,
          responseData: responses,
          respondentEmail: respondentInfo.email || undefined,
          respondentName: respondentInfo.name || undefined,
          completionRate: calculateCompletionRate(),
          deviceInfo: {
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString()
          }
        })
      } else {
        // Mock submission for demo
        await new Promise(resolve => setTimeout(resolve, 1500))
      }

      toast.success('Thank you! Your feedback has been submitted.')
      router.push('/feedback/thank-you')
    } catch (error) {
      toast.error('Failed to submit feedback. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading survey...</p>
        </div>
      </div>
    )
  }

  if (error && !survey) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-center">Survey Not Found</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground mb-4">
              This survey link may have expired or is no longer available.
            </p>
            <p className="text-sm text-muted-foreground">
              (Showing demo survey for development)
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const currentPageData = displaySurvey.pages[currentPage]
  const isLastPage = currentPage === displaySurvey.pages.length - 1

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto py-8 px-4 max-w-3xl">
        {/* Survey Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">{displaySurvey.title}</h1>
          <p className="text-gray-600 mb-4">{displaySurvey.description}</p>
          
          {displaySurvey.project && (
            <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm">
              <Briefcase className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium">
                Project: {displaySurvey.project.name}
              </span>
              <span className="text-sm text-muted-foreground">
                • {displaySurvey.project.clientName}
              </span>
            </div>
          )}
        </div>

        {/* Respondent Info (Optional) */}
        {currentPage === 0 && (
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="font-medium">Your Details (Optional)</p>
                  <p className="text-sm text-muted-foreground">
                    Help us follow up on your feedback if needed
                  </p>
                </div>
                <User className="h-5 w-5 text-muted-foreground" />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    placeholder="Your name"
                    value={respondentInfo.name}
                    onChange={(e) => setRespondentInfo(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={respondentInfo.email}
                    onChange={(e) => setRespondentInfo(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-sm mb-2">
            <span>Progress</span>
            <span>{calculateProgress()}% complete</span>
          </div>
          <Progress value={calculateProgress()} className="h-2" />
        </div>

        {/* Survey Questions */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="space-y-6">
              {currentPageData?.elements.map((question, index) => (
                <div key={question.name} className="relative">
                  <QuestionRenderer
                    question={question}
                    value={responses[question.name]}
                    onChange={(value) => handleValueChange(question.name, value)}
                  />
                  
                  {/* AI Suggestions for text questions */}
                  {question.type === 'comment' && aiSuggestions.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {aiSuggestions.map((suggestion, i) => (
                        <Alert key={i} className="bg-blue-50 border-blue-200">
                          <HelpCircle className="h-4 w-4" />
                          <AlertDescription className="flex items-center gap-2">
                            <Lightbulb className="h-3 w-3" />
                            {suggestion}
                          </AlertDescription>
                        </Alert>
                      ))}
                    </div>
                  )}
                  
                  {/* Sentiment Indicator */}
                  {question.type === 'comment' && 
                   responses[question.name]?.length > 50 && 
                   currentSentiment > 0 && (
                    <div className="absolute -right-12 top-0">
                      <SentimentIndicator score={currentSentiment} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
            disabled={currentPage === 0}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>
          
          {isLastPage ? (
            <Button 
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="min-w-32"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Submitting...
                </>
              ) : (
                <>
                  Submit Feedback
                  <Send className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          ) : (
            <Button 
              onClick={() => setCurrentPage(prev => prev + 1)}
              disabled={currentPage >= displaySurvey.pages.length - 1}
            >
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

// Question renderer component
function QuestionRenderer({ question, value, onChange }: any) {
  if (question.type === 'rating') {
    return (
      <div className="space-y-3">
        <Label className="text-base font-medium">{question.title}</Label>
        <div className="flex items-center gap-2">
          {Array.from({ length: question.rateMax }, (_, i) => i + 1).map(rating => (
            <Button
              key={rating}
              variant={value === rating ? 'default' : 'outline'}
              size="sm"
              onClick={() => onChange(rating)}
              className="w-10 h-10"
            >
              {rating}
            </Button>
          ))}
        </div>
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Poor</span>
          <span>Excellent</span>
        </div>
      </div>
    )
  }

  if (question.type === 'radiogroup') {
    return (
      <div className="space-y-3">
        <Label className="text-base font-medium">{question.title}</Label>
        <div className="space-y-2">
          {question.choices.map((choice: string, index: number) => (
            <div key={index} className="flex items-center space-x-2">
              <input
                type="radio"
                id={`${question.name}-${index}`}
                name={question.name}
                value={choice}
                checked={value === choice}
                onChange={(e) => onChange(e.target.value)}
                className="h-4 w-4 text-primary"
              />
              <Label htmlFor={`${question.name}-${index}`} className="text-sm font-normal">
                {choice}
              </Label>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (question.type === 'comment') {
    return (
      <div className="space-y-3">
        <Label htmlFor={question.name} className="text-base font-medium">
          {question.title}
        </Label>
        <Textarea
          id={question.name}
          rows={question.rows || 4}
          placeholder="Share your thoughts..."
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    )
  }

  return null
}

// Sentiment indicator component
function SentimentIndicator({ score }: { score: number }) {
  const getColor = (score: number) => {
    if (score > 0.7) return 'text-green-600'
    if (score > 0.4) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getEmoji = (score: number) => {
    if (score > 0.7) return '😊'
    if (score > 0.4) return '😐'
    return '😟'
  }

  return (
    <div className={`text-sm ${getColor(score)} text-center`}>
      <div className="text-lg">{getEmoji(score)}</div>
      <div className="text-xs">
        {Math.round(score * 100)}%
      </div>
    </div>
  )
}
