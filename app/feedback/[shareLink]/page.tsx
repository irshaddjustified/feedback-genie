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
import { apiClient } from '@/lib/api-client'
import { authHelpers } from '@/lib/firebase'
import { toast } from 'sonner'
import { useDebounce } from '@/lib/hooks/useDebounce'

// Type definitions
interface SurveyQuestion {
  name: string
  type: 'rating' | 'radiogroup' | 'comment'
  title: string
  isRequired?: boolean
  rateMin?: number
  rateMax?: number
  choices?: string[]
  rows?: number
}

interface SurveyPage {
  name: string
  elements: SurveyQuestion[]
}

interface Survey {
  id?: string
  title: string
  description: string
  shareLink?: string
  project?: {
    name: string
    clientName: string
  }
  pages: SurveyPage[]
}

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
  const [survey, setSurvey] = useState<Survey | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [firebaseUser, setFirebaseUser] = useState<any>(null)
  const [showAuthOptions, setShowAuthOptions] = useState(true)

  // Load survey data
  useEffect(() => {
    if (!shareLink) return
    
    const loadSurvey = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        // For now, let's get surveys and find by shareLink
        // In a real implementation, you'd have a specific API for this
        const surveys = await apiClient.surveys.getAll()
        const foundSurvey = surveys.find((s: any) => s.shareLink === shareLink)
        
        if (!foundSurvey) {
          setError('Survey not found or expired')
          return
        }
        
        setSurvey(foundSurvey)
      } catch (err: any) {
        setError('Failed to load survey: ' + (err?.message || 'Unknown error'))
      } finally {
        setIsLoading(false)
      }
    }
    
    loadSurvey()
  }, [shareLink])

  // Authentication functions
  const handleGoogleSignIn = async () => {
    try {
      const user = await authHelpers.signInWithGoogle()
      setFirebaseUser(user)
      setRespondentInfo({
        name: user?.displayName || '',
        email: user?.email || ''
      })
      setShowAuthOptions(false)
      toast.success('Signed in with Google!')
    } catch (error: any) {
      toast.error('Failed to sign in with Google')
    }
  }

  const handleAnonymousAccess = async () => {
    try {
      const user = await authHelpers.signInAnonymously()
      setFirebaseUser(user)
      setShowAuthOptions(false)
      toast.success('Continuing anonymously')
    } catch (error: any) {
      toast.error('Failed to continue anonymously')
    }
  }

  const handleSkipAuth = () => {
    setShowAuthOptions(false)
  }

  // Mock survey structure for demo
  const mockSurvey: Survey = {
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
  const displaySurvey: Survey = survey || mockSurvey

  // Debounced text analysis
  const debouncedAnalyzeText = useDebounce(async (questionName: string, value: string) => {
    if (value.length < 50) return

    try {
      const analysis = await apiClient.ai.analyze('temp-response-id', value)

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
        await apiClient.responses.create({
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
    } catch (error: any) {
      toast.error('Failed to submit feedback: ' + (error?.message || 'Please try again.'))
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

        {/* Authentication Options */}
        {showAuthOptions && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-center">How would you like to proceed?</CardTitle>
              <CardDescription className="text-center">
                Choose your preferred way to provide feedback
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={handleGoogleSignIn} 
                className="w-full" 
                variant="outline"
              >
                <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                  <path fill="#4285f4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34a853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#fbbc05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#ea4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </Button>
              
              <Button 
                onClick={handleAnonymousAccess} 
                className="w-full" 
                variant="outline"
              >
                <User className="h-4 w-4 mr-2" />
                Continue Anonymously
              </Button>
              
              <Button 
                onClick={handleSkipAuth} 
                className="w-full" 
                variant="ghost"
              >
                Skip and Continue
              </Button>
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
interface QuestionRendererProps {
  question: SurveyQuestion
  value: any
  onChange: (value: any) => void
}

function QuestionRenderer({ question, value, onChange }: QuestionRendererProps) {
  if (question.type === 'rating') {
    return (
      <div className="space-y-3">
        <Label className="text-base font-medium">{question.title}</Label>
        <div className="flex items-center gap-2">
          {Array.from({ length: question.rateMax || 10 }, (_, i) => i + 1).map(rating => (
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
          {(question.choices || []).map((choice: string, index: number) => (
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
