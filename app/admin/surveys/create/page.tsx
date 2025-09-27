'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import dynamic from 'next/dynamic'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Sparkles, 
  Plus, 
  FileText, 
  Users, 
  Calendar,
  Loader2,
  ArrowRight,
  Copy,
  QrCode,
  Download,
  Share,
  Save,
  Eye,
  Settings,
  Send
} from 'lucide-react'
import { apiClient } from '@/lib/api-client'
import { toast } from 'sonner'
import { SurveyQRDialog } from '@/components/survey/SurveyQRDialog'

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

const createSurveySchema = z.object({
  title: z.string().min(1, 'Survey title is required'),
  description: z.string().optional(),
  projectId: z.string().optional(),
  eventId: z.string().optional(),
  templateId: z.string(),
  type: z.enum(['PROJECT_FEEDBACK', 'EVENT_FEEDBACK', 'CUSTOM'])
})

type CreateSurveyForm = z.infer<typeof createSurveySchema>

const surveyTemplates = [
  {
    id: 'project-feedback',
    title: 'Project Feedback',
    description: 'Comprehensive feedback collection for client projects',
    type: 'PROJECT_FEEDBACK' as const,
    estimatedTime: '3-5 minutes',
    questionCount: 8
  },
  {
    id: 'event-feedback',
    title: 'Event Feedback',
    description: 'Post-event feedback and satisfaction survey',
    type: 'EVENT_FEEDBACK' as const,
    estimatedTime: '2-3 minutes', 
    questionCount: 6
  },
  {
    id: 'custom',
    title: 'Custom Survey',
    description: 'Build your own survey with AI assistance',
    type: 'CUSTOM' as const,
    estimatedTime: 'Variable',
  }
]

export default function CreateSurveyPage() {
  const router = useRouter()
  const [selectedTemplate, setSelectedTemplate] = useState<typeof surveyTemplates[0] | null>(null)
  const [aiGenerating, setAiGenerating] = useState(false)
  const [aiSuggestions, setAiSuggestions] = useState<any>(null)
  const [projects, setProjects] = useState<any[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loadingProjects, setLoadingProjects] = useState(true)
  const [createdSurvey, setCreatedSurvey] = useState<any>(null)
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)
  
  // Builder state
  const [activeTab, setActiveTab] = useState('create')
  const [surveyJson, setSurveyJson] = useState<any>(null)
  const [isModified, setIsModified] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const form = useForm<CreateSurveyForm>({
    resolver: zodResolver(createSurveySchema),
    defaultValues: {
      title: '',
      description: '',
      type: 'CUSTOM'
    }
  })

  // Load projects on component mount
  useEffect(() => {
    const loadProjects = async () => {
      try {
        const projectData = await apiClient.projects.getAll()
        setProjects(projectData)
      } catch (error) {
        console.error('Failed to load projects:', error)
        toast.error('Failed to load projects')
      } finally {
        setLoadingProjects(false)
      }
    }
    loadProjects()
  }, [])

  const handleTemplateSelect = (templateId: string) => {
    const template = surveyTemplates.find(t => t.id === templateId)
    setSelectedTemplate(template || null)
    if (template) {
      form.setValue('templateId', templateId)
      form.setValue('type', template.type)
    }
  }

  const generateWithAI = async () => {
    const projectId = form.getValues('projectId')
    const selectedProjectData = projects?.find(p => p.id === projectId)
    
    if (!selectedProjectData) {
      toast.error('Please select a project first')
      return
    }

    setAiGenerating(true)
    try {
      // Mock AI suggestions for now - replace with actual API call when AI service is ready
      const suggestions = {
        title: `${selectedProjectData.name} Feedback Survey`,
        description: `Collect feedback on the ${selectedProjectData.name} project for ${selectedProjectData.clientName}`,
        estimatedDuration: '3-5 minutes',
        recommendedQuestions: 'Overall satisfaction, communication quality, deliverable quality, timeline adherence'
      }
      
      setAiSuggestions(suggestions)
      form.setValue('title', suggestions.title)
      form.setValue('description', suggestions.description)
      
      toast.success('AI suggestions generated!')
    } catch (error: any) {
      toast.error('Failed to generate AI suggestions: ' + (error?.message || 'Unknown error'))
    } finally {
      setAiGenerating(false)
    }
  }

  const handleSubmit = async (data: CreateSurveyForm) => {
    if (!selectedTemplate) {
      toast.error('Please select a survey template')
      return
    }

    setIsSubmitting(true)
    try {
      // Generate a shorter, more user-friendly share link
      const generateShareLink = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
        let result = ''
        for (let i = 0; i < 8; i++) {
          result += chars.charAt(Math.floor(Math.random() * chars.length))
        }
        return result
      }

      const survey = await apiClient.surveys.create({
        ...data,
        shareLink: generateShareLink(), // Generate shorter, user-friendly share link
        status: 'DRAFT'
      })
      
      setCreatedSurvey(survey)
      setActiveTab('builder') // Switch to builder tab instead of showing dialog
      toast.success('Survey created! Now build your questions.')
    } catch (error: any) {
      toast.error('Failed to create survey: ' + (error?.message || 'Unknown error'))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleContinueToBuilder = () => {
    setShowSuccessDialog(false)
    router.push(`/admin/surveys/${createdSurvey.id}/builder`)
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast.success('Link copied to clipboard!')
    } catch (error) {
      toast.error('Failed to copy link')
    }
  }

  // Builder functions
  const handleSurveyChange = (newJson: any) => {
    setSurveyJson(newJson)
    setIsModified(true)
  }

  const handleSave = async () => {
    if (!surveyJson || !createdSurvey) return
    
    setIsSaving(true)
    try {
      await apiClient.surveys.update(createdSurvey.id, {
        schema: surveyJson
      })
      toast.success('Survey saved successfully!')
      setIsModified(false)
    } catch (error: any) {
      toast.error('Failed to save survey: ' + (error?.message || 'Unknown error'))
    } finally {
      setIsSaving(false)
    }
  }

  const handlePublish = async () => {
    if (!createdSurvey) return

    if (isModified) {
      await handleSave()
    }
    
    try {
      await apiClient.surveys.update(createdSurvey.id, { status: 'PUBLISHED' })
      toast.success('Survey published successfully!')
      router.push('/admin/dashboard')
    } catch (error: any) {
      toast.error('Failed to publish survey: ' + (error?.message || 'Unknown error'))
    }
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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-xl font-bold">
                {createdSurvey ? createdSurvey.title : 'Create New Survey'}
              </h1>
              {createdSurvey && (
                <div className="flex items-center gap-2">
                  <Badge variant={createdSurvey.status === 'PUBLISHED' ? 'default' : 'secondary'}>
                    {createdSurvey.status}
                  </Badge>
                </div>
              )}
            </div>
          </div>
          
          {/* Header Actions - Only show when in builder mode */}
          {activeTab === 'builder' && createdSurvey && (
            <div className="flex items-center gap-2">
              <SurveyQRDialog
                surveyId={createdSurvey.id}
                shareLink={createdSurvey.shareLink}
                surveyTitle={createdSurvey.title}
              />
              
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
              
              {createdSurvey.status === 'DRAFT' && (
                <Button
                  size="sm"
                  onClick={handlePublish}
                  disabled={isSaving}
                >
                  <Send className="h-4 w-4 mr-2" />
                  Publish
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex-1">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
          <div className="border-b">
            <div className="px-6">
              <TabsList className="grid w-full max-w-md grid-cols-3">
                <TabsTrigger value="create">Create</TabsTrigger>
                <TabsTrigger value="builder" disabled={!createdSurvey}>Builder</TabsTrigger>
                <TabsTrigger value="preview" disabled={!createdSurvey}>Preview</TabsTrigger>
              </TabsList>
            </div>
          </div>
          
          <TabsContent value="create" className="h-full">
            <div className="p-6 max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Survey Details</CardTitle>
            <CardDescription>
              Configure your survey settings and select a template
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              {/* Project Selection */}
              <div className="space-y-2">
                <Label>Select Project (Optional)</Label>
                <Select onValueChange={(value) => form.setValue('projectId', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a project or leave empty for general survey" />
                  </SelectTrigger>
                  <SelectContent>
                    {loadingProjects ? (
                      <SelectItem value="loading" disabled>
                        <div className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Loading projects...
                        </div>
                      </SelectItem>
                    ) : (
                      projects?.map(project => (
                        <SelectItem key={project.id} value={project.id}>
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            <div>
                              <div className="font-medium">{project.name}</div>
                              <div className="text-xs text-muted-foreground">
                                {project.clientName} • {project.status}
                              </div>
                            </div>
                          </div>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Survey Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Survey Title</Label>
                <div className="flex gap-2">
                  <Input
                    id="title"
                    placeholder="e.g., Q4 2024 Project Feedback Survey"
                    {...form.register('title')}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={generateWithAI}
                    disabled={aiGenerating || !form.getValues('projectId')}
                  >
                    {aiGenerating ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Sparkles className="h-4 w-4" />
                    )}
                    AI Suggest
                  </Button>
                </div>
                {form.formState.errors.title && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.title.message}
                  </p>
                )}
              </div>

              {/* Survey Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Brief description of the survey purpose and what you hope to learn..."
                  rows={3}
                  {...form.register('description')}
                />
              </div>

              {/* AI Suggestions Display */}
              {aiSuggestions && (
                <Card className="bg-blue-50 border-blue-200">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-blue-600" />
                      AI Suggestions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div>
                      <Label className="text-sm font-medium">Estimated Duration:</Label>
                      <p className="text-sm">{aiSuggestions.estimatedDuration}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Recommended Questions:</Label>
                      <p className="text-sm">{aiSuggestions.recommendedQuestions}</p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Template Selection */}
              <div className="space-y-2">
                <Label>Template Selection</Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {surveyTemplates.map(template => (
                    <Card 
                      key={template.id}
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        selectedTemplate?.id === template.id 
                          ? 'ring-2 ring-primary border-primary' 
                          : 'hover:border-muted-foreground/20'
                      }`}
                      onClick={() => handleTemplateSelect(template.id)}
                    >
                      <CardContent className="p-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            <span className="font-medium text-sm">{template.title}</span>
                          </div>
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            {template.description}
                          </p>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {template.estimatedTime}
                            </div>
                            {template.questionCount && (
                              <div className="flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                {template.questionCount} questions
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                {form.formState.errors.templateId && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.templateId.message}
                  </p>
                )}
              </div>

              <Button 
                type="submit" 
                className="w-full"
                disabled={isSubmitting || !selectedTemplate}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating survey...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Survey & Build
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
            </div>
          </TabsContent>

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
                      No survey content to preview yet. Use the Builder tab to add questions.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
