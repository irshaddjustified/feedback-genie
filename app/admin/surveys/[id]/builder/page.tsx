'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Save, 
  Eye, 
  Sparkles, 
  Plus, 
  Settings,
  Trash2,
  Copy,
  ArrowLeft,
  Send as Publish
} from 'lucide-react'
import { apiClient } from '@/lib/api-client'
import { toast } from 'sonner'

// Dynamically import SurveyJS components to avoid SSR issues
const SurveyCreator = dynamic(() => import('@/components/survey/SurveyCreator'), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center h-96">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
})

const SurveyPreview = dynamic(() => import('@/components/survey/SurveyPreview'), {
  ssr: false
})

export default function SurveyBuilderPage() {
  const params = useParams()
  const router = useRouter()
  const surveyId = params.id as string
  
  const [activeTab, setActiveTab] = useState('builder')
  const [surveyJson, setSurveyJson] = useState<any>(null)
  const [isModified, setIsModified] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [survey, setSurvey] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Load survey data
  useEffect(() => {
    if (!surveyId) return
    
    const loadSurvey = async () => {
      try {
        setIsLoading(true)
        const surveyData = await apiClient.surveys.getById(surveyId)
        setSurvey(surveyData)
        
        // Initialize survey JSON if it exists
        if (surveyData?.schema) {
          setSurveyJson(surveyData.schema)
        }
      } catch (error: any) {
        console.error('Failed to load survey:', error)
        toast.error('Failed to load survey: ' + (error?.message || 'Unknown error'))
      } finally {
        setIsLoading(false)
      }
    }
    
    loadSurvey()
  }, [surveyId])

  // Helper functions for API calls
  const updateSurveyApi = async (data: any) => {
    try {
      await apiClient.surveys.update(surveyId, data)
      toast.success('Survey saved successfully!')
      setIsModified(false)
    } catch (error: any) {
      toast.error('Failed to save survey: ' + (error?.message || 'Unknown error'))
    }
  }

  const publishSurveyApi = async () => {
    try {
      await apiClient.surveys.update(surveyId, { status: 'PUBLISHED' })
      toast.success('Survey published successfully!')
      router.push(`/admin/surveys/${surveyId}`)
    } catch (error: any) {
      toast.error('Failed to publish survey: ' + (error?.message || 'Unknown error'))
    }
  }

  useEffect(() => {
    if (survey?.template?.schema) {
      setSurveyJson(survey.template.schema)
    }
  }, [survey])

  const handleSurveyChange = (newJson: any) => {
    setSurveyJson(newJson)
    setIsModified(true)
  }

  const handleSave = async () => {
    if (!surveyJson) return
    
    setIsSaving(true)
    try {
      await updateSurveyApi({
        schema: surveyJson
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handlePublish = async () => {
    if (isModified) {
      await handleSave()
    }
    
    await publishSurveyApi()
  }

  const generateAIQuestions = async () => {
    try {
      // Mock AI question generation - replace with actual API call when ready
      const mockSuggestions = [
        {
          type: 'rating',
          name: 'overall_satisfaction',
          title: 'How satisfied are you with the overall experience?',
          rateMax: 5
        },
        {
          type: 'comment',
          name: 'improvements',
          title: 'What improvements would you suggest?',
          rows: 3
        },
        {
          type: 'radiogroup',
          name: 'recommendation',
          title: 'Would you recommend us to others?',
          choices: ['Definitely', 'Probably', 'Maybe', 'Probably not', 'Definitely not']
        }
      ]
      
      toast.success('AI suggestions generated!')
      console.log('AI suggestions:', mockSuggestions)
      // In a real implementation, show suggestions in a modal
    } catch (error: any) {
      toast.error('Failed to generate AI suggestions: ' + (error?.message || 'Unknown error'))
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading survey builder...</p>
        </div>
      </div>
    )
  }

  if (!survey) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>Survey Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              The survey you're looking for doesn't exist or you don't have permission to edit it.
            </p>
            <Button onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-xl font-bold">{survey.title}</h1>
              <div className="flex items-center gap-2">
                <Badge variant={survey.status === 'PUBLISHED' ? 'default' : 'secondary'}>
                  {survey.status}
                </Badge>
                {survey.project && (
                  <span className="text-sm text-muted-foreground">
                    {survey.project.name}
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={generateAIQuestions}
            >
              <Sparkles className="h-4 w-4 mr-2" />
              AI Suggest
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleSave}
              disabled={!isModified || isSaving}
            >
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
            
            {survey.status === 'DRAFT' && (
              <Button
                size="sm"
                onClick={handlePublish}
                disabled={isSaving}
              >
                <Publish className="h-4 w-4 mr-2" />
                Publish
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
          <div className="border-b">
            <div className="px-6">
              <TabsList className="grid w-full max-w-md grid-cols-3">
                <TabsTrigger value="builder">Builder</TabsTrigger>
                <TabsTrigger value="preview">Preview</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>
            </div>
          </div>
          
          <TabsContent value="builder" className="h-full">
            <div className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Survey Builder</h3>
                  <p className="text-sm text-muted-foreground">
                    Drag and drop questions to build your survey
                  </p>
                </div>
                {isModified && (
                  <Badge variant="secondary">Unsaved changes</Badge>
                )}
              </div>
              
              <SurveyCreator
                json={surveyJson}
                onSurveyChange={handleSurveyChange}
              />
            </div>
          </TabsContent>
          
          <TabsContent value="preview" className="h-full">
            <div className="p-6">
              <div className="mb-4">
                <h3 className="text-lg font-semibold">Survey Preview</h3>
                <p className="text-sm text-muted-foreground">
                  See how your survey will appear to respondents
                </p>
              </div>
              
              <div className="border rounded-lg p-6 bg-card">
                {surveyJson ? (
                  <SurveyPreview json={surveyJson} />
                ) : (
                  <div className="text-center py-12">
                    <Eye className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      No survey content to preview yet
                    </p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="settings" className="h-full">
            <div className="p-6">
              <div className="max-w-2xl">
                <h3 className="text-lg font-semibold mb-4">Survey Settings</h3>
                
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Basic Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <label className="text-sm font-medium">Survey Title</label>
                        <p className="text-sm text-muted-foreground">{survey.title}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Description</label>
                        <p className="text-sm text-muted-foreground">
                          {survey.description || 'No description provided'}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Share Link</label>
                        <div className="flex items-center gap-2">
                          <code className="text-sm bg-muted px-2 py-1 rounded">
                            {window.location.origin}/feedback/{survey.shareLink}
                          </code>
                          <Button size="sm" variant="outline">
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">AI Analysis</CardTitle>
                      <CardDescription>
                        Configure how AI will analyze responses to this survey
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Sentiment Analysis</p>
                          <p className="text-sm text-muted-foreground">
                            Automatically detect emotional tone in responses
                          </p>
                        </div>
                        <input type="checkbox" defaultChecked className="rounded" />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Category Detection</p>
                          <p className="text-sm text-muted-foreground">
                            Automatically categorize feedback themes
                          </p>
                        </div>
                        <input type="checkbox" defaultChecked className="rounded" />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Priority Flagging</p>
                          <p className="text-sm text-muted-foreground">
                            Flag critical issues for immediate attention
                          </p>
                        </div>
                        <input type="checkbox" defaultChecked className="rounded" />
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base text-red-600">Danger Zone</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Delete Survey</p>
                          <p className="text-sm text-muted-foreground">
                            Permanently delete this survey and all responses
                          </p>
                        </div>
                        <Button variant="destructive" size="sm">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
